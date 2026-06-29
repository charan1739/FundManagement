const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity, getChartData, getRecentTransactions } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/charts', getChartData);
router.get('/transactions', getRecentTransactions);

module.exports = router;
