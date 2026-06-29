const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .populate('relatedGroup', 'name')
      .populate('relatedRequest', 'amount purpose status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);

  res.json({ success: true, data: notifications, unreadCount, pagination: { page: Number(page), total, totalPages: Math.ceil(total / Number(limit)) } });
});

// PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true });
  res.json({ success: true });
});

// PATCH /api/notifications/read
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markRead, markAllRead };
