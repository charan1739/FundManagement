const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getRequestById, getUserRequests, approveRequest, rejectRequest, markTransferred, confirmReceipt } = require('../controllers/requestController');

router.use(protect);

router.get('/user', getUserRequests);
router.get('/:id', getRequestById);
router.patch('/:id/approve', approveRequest);
router.patch('/:id/reject', rejectRequest);
router.patch('/:id/transfer', markTransferred);
router.patch('/:id/confirm', upload.single('receipt'), confirmReceipt);

module.exports = router;
