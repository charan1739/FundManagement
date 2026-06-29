const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  fundRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'FundRequest' },
  type: { type: String, enum: ['fund-added', 'transfer-completed'], required: true },
  amount: { type: Number, required: true, min: 1 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: { type: String, trim: true, maxlength: 200 },
  proofUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

// Immutable — no updates or deletes
transactionSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
  throw new Error('Transactions are immutable');
});
transactionSchema.pre(['deleteOne', 'findOneAndDelete', 'deleteMany'], function () {
  throw new Error('Transactions are immutable');
});

transactionSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
