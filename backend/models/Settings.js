const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      default: 'My Organization',
      trim: true,
    },
    currency: {
      symbol: { type: String, default: '₹' },
      code: { type: String, default: 'INR' },
      name: { type: String, default: 'Indian Rupee' },
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
    logo: {
      type: String,
      default: null,
    },
    lowBalanceThreshold: {
      type: Number,
      default: 5000,
    },
    // Singleton document
    singleton: {
      type: Boolean,
      default: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
