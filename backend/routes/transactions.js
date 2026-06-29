const express = require('express');
const router = express.Router({ mergeParams: true });
const { getTransactions, exportTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const { anyMember } = require('../middleware/role');

router.use(protect);
router.get('/', anyMember, getTransactions);
router.get('/export', anyMember, exportTransactions);

module.exports = router;
