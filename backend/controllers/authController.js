const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const signTokens = (userId) => ({
  accessToken: jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  }),
  refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  }),
});

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password)
    return res.status(400).json({ success: false, message: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ success: false, message: 'Email already registered' });
  if (await User.findOne({ username: username.toLowerCase() }))
    return res.status(409).json({ success: false, message: 'Username already taken' });

  const user = await User.create({ name, email, username, password });
  const { accessToken, refreshToken } = signTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, username: user.username },
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const { accessToken, refreshToken } = signTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, username: user.username, phone: user.phone },
    },
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.json({ success: true, message: 'Logged out' });
});

// POST /api/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(401).json({ success: false, message: 'Refresh token required' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token)
    return res.status(401).json({ success: false, message: 'Refresh token revoked' });

  const tokens = signTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
});

module.exports = { register, login, logout, refreshToken };
