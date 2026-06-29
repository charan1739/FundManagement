const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProjectSummary, getMonthlyReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { canManageFunds } = require('../middleware/role');

router.use(protect);
router.get('/summary', canManageFunds, getProjectSummary);
router.get('/monthly', canManageFunds, getMonthlyReport);

module.exports = router;
