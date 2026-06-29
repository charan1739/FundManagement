const mongoose = require('mongoose');
const { generateGroupCode } = require('../utils/generateGroupCode');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 300 },
  groupCode: { type: String, unique: true, uppercase: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentBalance: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

groupSchema.pre('save', function (next) {
  if (!this.groupCode) {
    this.groupCode = generateGroupCode();
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);
