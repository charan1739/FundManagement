const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, deleteAccount, updateFcmToken } = require('../controllers/profileController');

router.use(protect);
router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/password', changePassword);
router.patch('/fcm-token', updateFcmToken);
router.delete('/', deleteAccount);

module.exports = router;
