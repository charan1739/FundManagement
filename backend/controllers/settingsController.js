const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get settings
// @route   GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ singleton: true });
  if (!settings) {
    settings = await Settings.create({ singleton: true });
  }
  successResponse(res, 200, 'Settings fetched', settings);
});

// @desc    Update settings
// @route   PUT /api/settings
const updateSettings = asyncHandler(async (req, res) => {
  const { orgName, timezone, theme, lowBalanceThreshold } = req.body;
  const updates = {};
  if (orgName) updates.orgName = orgName;
  if (timezone) updates.timezone = timezone;
  if (theme && ['dark', 'light'].includes(theme)) updates.theme = theme;
  if (lowBalanceThreshold !== undefined) updates.lowBalanceThreshold = Number(lowBalanceThreshold);

  const settings = await Settings.findOneAndUpdate({ singleton: true }, updates, { new: true, upsert: true });
  successResponse(res, 200, 'Settings updated', settings);
});

module.exports = { getSettings, updateSettings };
