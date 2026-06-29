const FundRequest = require('../models/FundRequest');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Transaction = require('../models/Transaction');
const { logActivity } = require('../utils/activityLogger');
const { sendNotification } = require('../utils/notificationService');
const { getFileUrl } = require('../middleware/upload');
const { getIO } = require('../utils/socketService');
const asyncHandler = require('../utils/asyncHandler');

const fmtAmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// POST /api/groups/:id/requests
const createRequest = asyncHandler(async (req, res) => {
  const { amount, purpose, description, requiredDate } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });
  if (!purpose?.trim()) return res.status(400).json({ success: false, message: 'Purpose is required' });

  const group = await Group.findById(req.params.id);
  const attachmentUrl = req.file ? getFileUrl(req, req.file) : null;

  const request = await FundRequest.create({
    group: req.params.id, requestedBy: req.user._id,
    amount: Number(amount), purpose: purpose.trim(),
    description: description?.trim(), requiredDate: requiredDate ? new Date(requiredDate) : undefined,
    attachmentUrl,
  });

  const admin = await GroupMember.findOne({ group: req.params.id, role: 'admin', status: 'active' });
  if (admin) {
    await sendNotification({ recipients: admin.user, type: 'request_raised', title: 'New Fund Request',
      message: `${req.user.name} requested ${fmtAmt(amount)} for "${purpose.trim()}" in "${group.name}"`,
      relatedGroup: group._id, relatedRequest: request._id });
  }
  await logActivity({ groupId: group._id, userId: req.user._id, action: `${req.user.name} requested ${fmtAmt(amount)} for "${purpose.trim()}"` });

  const populated = await FundRequest.findById(request._id).populate('requestedBy', 'name username');
  res.status(201).json({ success: true, data: populated });
});

// GET /api/groups/:id/requests
const getRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { group: req.params.id };
  if (status) filter.status = status;
  const requests = await FundRequest.find(filter)
    .populate('requestedBy', 'name username')
    .populate('approvedBy', 'name')
    .populate('rejectedBy', 'name')
    .populate('transferredBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: requests });
});

// GET /api/requests/:id
const getRequestById = asyncHandler(async (req, res) => {
  const request = await FundRequest.findById(req.params.id)
    .populate('requestedBy', 'name username')
    .populate('group', 'name groupCode')
    .populate('approvedBy', 'name')
    .populate('rejectedBy', 'name')
    .populate('transferredBy', 'name');
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  res.json({ success: true, data: request });
});

// GET /api/user/requests
const getUserRequests = asyncHandler(async (req, res) => {
  const requests = await FundRequest.find({ requestedBy: req.user._id })
    .populate('group', 'name groupCode')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: requests });
});

// PATCH /api/requests/:id/approve
const approveRequest = asyncHandler(async (req, res) => {
  const request = await FundRequest.findById(req.params.id).populate('group');
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  if (request.status !== 'pending') return res.status(400).json({ success: false, message: `Cannot approve a ${request.status} request` });

  request.status = 'approved';
  request.approvedBy = req.user._id;
  request.approvedAt = new Date();
  await request.save();

  await sendNotification({ recipients: request.requestedBy, type: 'request_approved', title: 'Request Approved',
    message: `Your request for ${fmtAmt(request.amount)} in "${request.group.name}" was approved`,
    relatedGroup: request.group._id, relatedRequest: request._id });
  await logActivity({ groupId: request.group._id, userId: req.user._id, action: `${req.user.name} approved ${request.requestedBy}'s request for ${fmtAmt(request.amount)}` });

  try { getIO().to(`group:${request.group._id}`).emit('request:status_changed', { requestId: request._id, status: 'approved' }); } catch {}
  res.json({ success: true, data: request });
});

// PATCH /api/requests/:id/reject
const rejectRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason?.trim()) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

  const request = await FundRequest.findById(req.params.id).populate('group');
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  if (!['pending', 'approved'].includes(request.status)) return res.status(400).json({ success: false, message: `Cannot reject a ${request.status} request` });

  request.status = 'rejected';
  request.rejectedBy = req.user._id;
  request.rejectedAt = new Date();
  request.rejectedReason = reason.trim();
  await request.save();

  await sendNotification({ recipients: request.requestedBy, type: 'request_rejected', title: 'Request Rejected',
    message: `Your request for ${fmtAmt(request.amount)} was rejected: "${reason.trim()}"`,
    relatedGroup: request.group._id, relatedRequest: request._id });
  await logActivity({ groupId: request.group._id, userId: req.user._id, action: `${req.user.name} rejected a request for ${fmtAmt(request.amount)}` });

  try { getIO().to(`group:${request.group._id}`).emit('request:status_changed', { requestId: request._id, status: 'rejected' }); } catch {}
  res.json({ success: true, data: request });
});

// PATCH /api/requests/:id/transfer
const markTransferred = asyncHandler(async (req, res) => {
  const request = await FundRequest.findById(req.params.id).populate('group requestedBy');
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  if (request.status !== 'approved') return res.status(400).json({ success: false, message: 'Request must be approved first' });

  request.status = 'transferred';
  request.transferredBy = req.user._id;
  request.transferredAt = new Date();
  await request.save();

  await sendNotification({ recipients: request.requestedBy._id, type: 'funds_transferred', title: 'Funds Transferred',
    message: `${fmtAmt(request.amount)} has been transferred to you for "${request.purpose}". Please confirm receipt.`,
    relatedGroup: request.group._id, relatedRequest: request._id });
  await logActivity({ groupId: request.group._id, userId: req.user._id, action: `${req.user.name} marked ${fmtAmt(request.amount)} as transferred to ${request.requestedBy.name}` });

  try { getIO().to(`group:${request.group._id}`).emit('request:status_changed', { requestId: request._id, status: 'transferred' }); } catch {}
  res.json({ success: true, data: request });
});

// PATCH /api/requests/:id/confirm
const confirmReceipt = asyncHandler(async (req, res) => {
  const request = await FundRequest.findById(req.params.id).populate('group');
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
  if (request.status !== 'transferred') return res.status(400).json({ success: false, message: 'Funds must be marked as transferred first' });
  if (request.requestedBy.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Only the requester can confirm receipt' });

  const group = await Group.findById(request.group._id);
  if (group.currentBalance < request.amount)
    return res.status(400).json({ success: false, message: 'Insufficient group balance' });

  const receiptUrl = req.file ? getFileUrl(req, req.file) : null;

  group.currentBalance -= request.amount;
  await group.save();

  await Transaction.create({
    group: group._id, fundRequest: request._id, type: 'transfer-completed',
    amount: request.amount, addedBy: req.user._id, remarks: request.purpose,
  });

  request.status = 'completed';
  request.receivedAt = new Date();
  request.completedAt = new Date();
  if (receiptUrl) request.receiptUrl = receiptUrl;
  await request.save();

  const admin = await GroupMember.findOne({ group: group._id, role: 'admin', status: 'active' });
  if (admin) {
    await sendNotification({ recipients: admin.user, type: 'confirm_pending', title: 'Receipt Confirmed',
      message: `${req.user.name} confirmed receipt of ${fmtAmt(request.amount)} for "${request.purpose}"`,
      relatedGroup: group._id, relatedRequest: request._id });
  }
  await logActivity({ groupId: group._id, userId: req.user._id, action: `${req.user.name} confirmed receipt of ${fmtAmt(request.amount)} — balance updated to ${fmtAmt(group.currentBalance)}` });

  try {
    const io = getIO();
    io.to(`group:${group._id}`).emit('balance:updated', { groupId: group._id, newBalance: group.currentBalance });
    io.to(`group:${group._id}`).emit('request:status_changed', { requestId: request._id, status: 'completed' });
  } catch {}

  res.json({ success: true, data: { request, newBalance: group.currentBalance } });
});

module.exports = { createRequest, getRequests, getRequestById, getUserRequests, approveRequest, rejectRequest, markTransferred, confirmReceipt };
