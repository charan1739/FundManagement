const GroupMember = require('../models/GroupMember');
const Group = require('../models/Group');
const User = require('../models/User');
const { sendNotification } = require('../utils/notificationService');
const { logActivity } = require('../utils/activityLogger');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/groups/:id/members
const getMembers = asyncHandler(async (req, res) => {
  const members = await GroupMember.find({
    group: req.params.id,
    status: { $in: ['active', 'pending'] },
  }).populate('user', 'name username email');
  res.json({ success: true, data: members });
});

// GET /api/groups/pending-invites  (no :id — user's own invites)
const getPendingInvites = asyncHandler(async (req, res) => {
  const invites = await GroupMember.find({ user: req.user._id, status: 'pending' })
    .populate({ path: 'group', populate: { path: 'createdBy', select: 'name username' } });
  res.json({ success: true, data: invites });
});

// POST /api/groups/:id/members  — admin invites by username/email
const addMember = asyncHandler(async (req, res) => {
  const { emailOrUsername } = req.body;
  if (!emailOrUsername)
    return res.status(400).json({ success: false, message: 'Email or username is required' });

  const target = await User.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }],
  });
  if (!target) return res.status(404).json({ success: false, message: 'User not found' });
  if (target._id.toString() === req.user._id.toString())
    return res.status(400).json({ success: false, message: 'You are already in the group' });

  const existing = await GroupMember.findOne({ group: req.params.id, user: target._id });
  if (existing) {
    const msg = existing.status === 'active' ? 'User is already a member'
      : existing.status === 'pending' ? 'Invite already sent'
      : 'User was previously removed';
    return res.status(409).json({ success: false, message: msg });
  }

  const group = await Group.findById(req.params.id);
  await GroupMember.create({ group: req.params.id, user: target._id, role: 'member', status: 'pending' });

  await sendNotification({
    recipients: target._id,
    type: 'join_request',
    title: 'Group Invite',
    message: `${req.user.name} invited you to join "${group.name}"`,
    relatedGroup: group._id,
  });

  res.status(201).json({ success: true, message: `Invite sent to ${target.name}` });
});

// POST /api/groups/join  — member joins by group code
const joinByCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Group code is required' });

  const group = await Group.findOne({ groupCode: code.toUpperCase().trim() });
  if (!group || group.status !== 'active')
    return res.status(404).json({ success: false, message: 'Invalid or expired group code' });

  const existing = await GroupMember.findOne({ group: group._id, user: req.user._id });
  if (existing?.status === 'active')
    return res.status(409).json({ success: false, message: 'You are already a member of this group' });

  if (existing?.status === 'pending') {
    // Accept the existing invite
    existing.status = 'active';
    existing.joinedAt = new Date();
    await existing.save();
  } else {
    await GroupMember.create({ group: group._id, user: req.user._id, role: 'member', status: 'active', joinedAt: new Date() });
  }

  const admin = await GroupMember.findOne({ group: group._id, role: 'admin', status: 'active' });
  if (admin) {
    await sendNotification({
      recipients: admin.user,
      type: 'member_joined',
      title: 'Member Joined',
      message: `${req.user.name} joined "${group.name}" via group code`,
      relatedGroup: group._id,
    });
  }

  await logActivity({ groupId: group._id, userId: req.user._id, action: `${req.user.name} joined the group` });
  res.json({ success: true, message: `Joined "${group.name}"`, data: { groupId: group._id } });
});

// POST /api/groups/:id/join  — accept pending invite
const acceptInvite = asyncHandler(async (req, res) => {
  const membership = await GroupMember.findOne({ group: req.params.id, user: req.user._id, status: 'pending' });
  if (!membership) return res.status(404).json({ success: false, message: 'No pending invite found' });

  membership.status = 'active';
  membership.joinedAt = new Date();
  await membership.save();

  const group = await Group.findById(req.params.id);
  const admin = await GroupMember.findOne({ group: req.params.id, role: 'admin', status: 'active' });
  if (admin) {
    await sendNotification({
      recipients: admin.user,
      type: 'join_accepted',
      title: 'Invite Accepted',
      message: `${req.user.name} accepted your invite to "${group.name}"`,
      relatedGroup: group._id,
    });
  }

  await logActivity({ groupId: group._id, userId: req.user._id, action: `${req.user.name} joined the group` });
  res.json({ success: true, message: 'You have joined the group' });
});

// POST /api/groups/:id/decline
const declineInvite = asyncHandler(async (req, res) => {
  await GroupMember.findOneAndUpdate(
    { group: req.params.id, user: req.user._id, status: 'pending' },
    { status: 'inactive' }
  );
  res.json({ success: true, message: 'Invite declined' });
});

// DELETE /api/groups/:id/members/:userId  — admin removes member
const removeMember = asyncHandler(async (req, res) => {
  if (req.params.userId === req.user._id.toString())
    return res.status(400).json({ success: false, message: 'Admin cannot remove themselves' });

  const membership = await GroupMember.findOne({ group: req.params.id, user: req.params.userId, status: 'active' });
  if (!membership) return res.status(404).json({ success: false, message: 'Member not found' });

  membership.status = 'inactive';
  await membership.save();

  const group = await Group.findById(req.params.id);
  const target = await User.findById(req.params.userId);
  await logActivity({ groupId: group._id, userId: req.user._id, action: `${req.user.name} removed ${target?.name} from the group` });
  await sendNotification({
    recipients: req.params.userId,
    type: 'member_removed',
    title: 'Removed from Group',
    message: `You were removed from "${group.name}"`,
    relatedGroup: group._id,
  });

  res.json({ success: true, message: 'Member removed' });
});

module.exports = { getMembers, getPendingInvites, addMember, joinByCode, acceptInvite, declineInvite, removeMember };
