const ActivityLog = require('../models/ActivityLog');
const { getIO } = require('./socketService');

/**
 * Logs an activity entry and emits group:activity socket event.
 * @param {Object} opts
 * @param {string} opts.groupId
 * @param {string} opts.userId
 * @param {string} opts.action  - human-readable log string
 */
const logActivity = async ({ groupId, userId, action }) => {
  try {
    await ActivityLog.create({ group: groupId, user: userId, action });

    // Notify all members viewing this group
    try {
      const io = getIO();
      io.to(`group:${groupId}`).emit('group:activity', {
        groupId,
        action,
        timestamp: new Date(),
      });
    } catch {
      // Socket not initialized in test/seed context — ignore
    }
  } catch (err) {
    console.error('activityLogger error:', err.message);
  }
};

module.exports = { logActivity };
