const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users/search?q=...
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ success: true, data: [] });
  }

  const query = q.trim();
  const searchRegex = new RegExp(query, 'i');

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { username: searchRegex },
      { email: searchRegex },
      { name: searchRegex }
    ]
  })
  .select('name username email')
  .limit(20);

  res.json({ success: true, data: users });
});

module.exports = { searchUsers };
