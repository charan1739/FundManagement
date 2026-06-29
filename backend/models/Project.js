const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../config/constants');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    allocatedBalance: {
      type: Number,
      default: 0,
      min: [0, 'Allocated balance cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.ACTIVE,
    },
    logo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual: available balance
projectSchema.virtual('availableBalance').get(function () {
  return this.currentBalance - this.allocatedBalance;
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
