const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'request_raised', 'request_approved', 'request_rejected',
      'funds_transferred', 'confirm_pending',
      'member_joined', 'member_removed',
      'join_request', 'join_accepted', 'join_declined',
      'funds_added',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'FundRequest' },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
