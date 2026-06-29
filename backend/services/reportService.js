const ActivityLog = require('../models/ActivityLog');

/**
 * Create an audit log entry.
 */
const logActivity = async ({ project, user, action, actionType, metadata = {}, ip = null }) => {
  try {
    await ActivityLog.create({ project, user, action, actionType, metadata, ip });
  } catch (err) {
    console.error('[ActivityLog Error]', err.message);
  }
};

module.exports = { logActivity };
