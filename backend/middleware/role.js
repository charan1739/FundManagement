const GroupMember = require('../models/GroupMember');

/**
 * Attaches req.membership to the request.
 * Requires protect middleware to run first (req.user must exist).
 * Also sets req.groupId from req.params.id.
 */
const loadMembership = async (req, res, next) => {
  const groupId = req.params.id || req.params.groupId;
  if (!groupId) return next();

  const membership = await GroupMember.findOne({
    group: groupId,
    user: req.user._id,
    status: 'active',
  });

  req.membership = membership;
  req.groupId = groupId;
  next();
};

const requireMember = (req, res, next) => {
  if (!req.membership) {
    return res.status(403).json({ success: false, message: 'You are not a member of this group' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.membership || req.membership.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only group admins can perform this action' });
  }
  next();
};

module.exports = { loadMembership, requireMember, requireAdmin };
