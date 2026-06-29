const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../utils/activityLogger');
const { sendNotification } = require('../utils/notificationService');
const { getFileUrl } = require('../middleware/upload');
const { getIO } = require('../utils/socketService');
const asyncHandler = require('../utils/asyncHandler');

const addFunds = asyncHandler(async (req, res) => {
  const { amount, source, remarks, transactionDate } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ success: false, message: 'Valid amount is required' });

  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const proofUrl = req.file ? getFileUrl(req, req.file) : null;

  const txn = await Transaction.create({
    group: group._id, type: 'fund-added', amount: Number(amount),
    addedBy: req.user._id, remarks: remarks || source, proofUrl,
    createdAt: transactionDate ? new Date(transactionDate) : new Date(),
  });

  group.currentBalance += Number(amount);
  await group.save();

  const amtStr = `₹${Number(amount).toLocaleString('en-IN')}`;
  await logActivity({ groupId: group._id, userId: req.user._id, action: `${req.user.name} added ${amtStr} to the group` });

  const members = await GroupMember.find({ group: group._id, status: 'active', user: { $ne: req.user._id } }).select('user');
  if (members.length) {
    await sendNotification({ recipients: members.map((m) => m.user), type: 'funds_added', title: 'Funds Added',
      message: `${req.user.name} added ${amtStr} to "${group.name}"`, relatedGroup: group._id });
  }

  try { getIO().to(`group:${group._id}`).emit('balance:updated', { groupId: group._id, newBalance: group.currentBalance }); } catch {}

  const populated = await Transaction.findById(txn._id).populate('addedBy', 'name username');
  res.status(201).json({ success: true, data: { transaction: populated, newBalance: group.currentBalance } });
});

const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [transactions, total] = await Promise.all([
    Transaction.find({ group: req.params.id })
      .populate('addedBy', 'name username')
      .populate({ path: 'fundRequest', select: 'purpose requestedBy', populate: { path: 'requestedBy', select: 'name' } })
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments({ group: req.params.id }),
  ]);
  res.json({ success: true, data: transactions, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
});

const getActivity = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    ActivityLog.find({ group: req.params.id }).populate('user', 'name username').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ActivityLog.countDocuments({ group: req.params.id }),
  ]);
  res.json({ success: true, data: logs, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
});

module.exports = { addFunds, getTransactions, getActivity };
