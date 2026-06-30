const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('./socketService');
const { getAdmin } = require('./firebaseAdmin');

/**
 * Creates a notification record and emits notification:new socket event to the recipient.
 * @param {Object} opts
 * @param {string|string[]} opts.recipients  - userId or array of userIds
 * @param {string} opts.type
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.relatedGroup]
 * @param {string} [opts.relatedRequest]
 */
const sendNotification = async ({ recipients, type, title, message, relatedGroup, relatedRequest }) => {
  const ids = Array.isArray(recipients) ? recipients : [recipients];

  try {
    const docs = ids.map((uid) => ({
      recipient: uid,
      type,
      title,
      message,
      relatedGroup: relatedGroup || undefined,
      relatedRequest: relatedRequest || undefined,
    }));

    const created = await Notification.insertMany(docs);

    // Emit socket event to each recipient's personal room
    try {
      const io = getIO();
      for (const notif of created) {
        io.to(`user:${notif.recipient}`).emit('notification:new', {
          _id: notif._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          relatedGroup: notif.relatedGroup,
          relatedRequest: notif.relatedRequest,
          createdAt: notif.createdAt,
        });
      }
    } catch {
      // Socket not initialized in test/seed context — ignore
    }
    // Send FCM Push Notifications
    try {
      const admin = getAdmin();
      if (admin) {
        // Fetch all recipients to get their FCM tokens
        const users = await User.find({ _id: { $in: ids } }).select('fcmTokens');
        const tokens = users.flatMap(u => u.fcmTokens || []);
        
        if (tokens.length > 0) {
          const messagePayload = {
            notification: { title, body: message },
            tokens,
          };
          
          admin.messaging().sendEachForMulticast(messagePayload)
            .then(response => {
              if (response.failureCount > 0) {
                console.log(`[FCM] Sent with ${response.failureCount} failures.`);
              }
            })
            .catch(err => console.error('[FCM] Error sending multicast:', err.message));
        }
      }
    } catch (err) {
      console.error('[FCM] Push error:', err.message);
    }
  } catch (err) {
    console.error('notificationService error:', err.message);
  }
};

module.exports = { sendNotification };
