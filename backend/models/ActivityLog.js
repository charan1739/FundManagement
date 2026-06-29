const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, trim: true },
}, { timestamps: true });

activityLogSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
