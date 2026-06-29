const mongoose = require('mongoose');

const fundRequestSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 },
  purpose: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 200 },
  requiredDate: { type: Date },
  attachmentUrl: { type: String }, // supporting document from requester
  receiptUrl: { type: String },    // receipt uploaded on confirmation

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'transferred', 'received', 'completed'],
    default: 'pending',
  },

  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date },
  rejectedReason: { type: String, trim: true, maxlength: 200 },

  transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transferredAt: { type: Date },

  receivedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

fundRequestSchema.index({ group: 1, status: 1 });
fundRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('FundRequest', fundRequestSchema);
