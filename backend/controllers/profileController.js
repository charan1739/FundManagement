const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { _id: req.user._id, name: req.user.name, email: req.user.email, username: req.user.username, phone: req.user.phone } });
});

// PATCH /api/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone.trim();

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
  res.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, username: user.username, phone: user.phone } });
});

// PATCH /api/profile/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ success: false, message: 'Both passwords are required' });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword)))
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

// DELETE /api/profile
const deleteAccount = asyncHandler(async (req, res) => {
  const { confirmation } = req.body;
  if (confirmation !== 'DELETE')
    return res.status(400).json({ success: false, message: 'Type DELETE to confirm account deletion' });

  await User.findByIdAndDelete(req.user._id);
  res.json({ success: true, message: 'Account deleted' });
});

// PATCH /api/profile/fcm-token
const updateFcmToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { fcmTokens: token }
  });
  
  res.json({ success: true, message: 'FCM token registered' });
});

module.exports = { getProfile, updateProfile, changePassword, deleteAccount, updateFcmToken };
