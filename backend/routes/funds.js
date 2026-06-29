const express = require('express');
const router = express.Router({ mergeParams: true });
const { addFunds, getFunds } = require('../controllers/fundController');
const { protect } = require('../middleware/auth');
const { canManageFunds, anyMember } = require('../middleware/role');
const { upload } = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(anyMember, getFunds)
  .post(canManageFunds, upload.single('receipt'), addFunds);

module.exports = router;
