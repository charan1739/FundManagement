const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const FundRequest = require('../models/FundRequest');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/groups
const getMyGroups = asyncHandler(async (req, res) => {
  const memberships = await GroupMember.find({ user: req.user._id, status: 'active' })
    .populate({ path: 'group', populate: { path: 'createdBy', select: 'name username' } });

  const groups = memberships
    .filter((m) => m.group && m.group.status === 'active')
    .map((m) => ({ ...m.group.toObject(), myRole: m.role }));

  res.json({ success: true, data: groups });
});

// POST /api/groups
const createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) return res.status(400).json({ success: false, message: 'Group name is required' });

  const group = await Group.create({ name: name.trim(), description: description?.trim(), createdBy: req.user._id });

  await GroupMember.create({
    group: group._id, user: req.user._id, role: 'admin', status: 'active', joinedAt: new Date(),
  });

  res.status(201).json({ success: true, data: { ...group.toObject(), myRole: 'admin' } });
});

// GET /api/groups/:id
const getGroup = asyncHandler(async (req, res) => {
  const membership = await GroupMember.findOne({ group: req.params.id, user: req.user._id, status: 'active' });
  if (!membership) return res.status(403).json({ success: false, message: 'You are not a member of this group' });

  const group = await Group.findById(req.params.id).populate('createdBy', 'name username');
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  // Compute available balance = currentBalance - sum of approved+transferred requests
  const allocated = await FundRequest.aggregate([
    { $match: { group: group._id, status: { $in: ['approved', 'transferred'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const allocatedTotal = allocated[0]?.total || 0;
  const availableBalance = Math.max(0, group.currentBalance - allocatedTotal);

  res.json({
    success: true,
    data: {
      ...group.toObject(),
      myRole: membership.role,
      availableBalance,
      allocatedBalance: allocatedTotal,
    },
  });
});

// DELETE /api/groups/:id  (admin only, handled by role middleware)
const deleteGroup = asyncHandler(async (req, res) => {
  await Group.findByIdAndUpdate(req.params.id, { status: 'archived' });
  res.json({ success: true, message: 'Group archived' });
});

module.exports = { getMyGroups, createGroup, getGroup, deleteGroup };
