const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const FundRequest = require('../models/FundRequest');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const memberships = await ProjectMember.find({ user: req.user._id, status: 'active' }).select('project');
  const projectIds = memberships.map((m) => m.project);

  const [totalProjects, totalBalance, pendingRequests, approvedRequests, completedTransfers] = await Promise.all([
    Project.countDocuments({ _id: { $in: projectIds } }),
    Project.aggregate([
      { $match: { _id: { $in: projectIds } } },
      { $group: { _id: null, total: { $sum: '$currentBalance' } } },
    ]),
    FundRequest.countDocuments({ project: { $in: projectIds }, status: 'pending' }),
    FundRequest.countDocuments({ project: { $in: projectIds }, status: 'approved' }),
    FundRequest.countDocuments({ project: { $in: projectIds }, status: 'completed' }),
  ]);

  successResponse(res, 200, 'Dashboard stats', {
    totalProjects,
    totalBalance: totalBalance[0]?.total || 0,
    pendingRequests,
    approvedRequests,
    completedTransfers,
  });
});

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
const getRecentActivity = asyncHandler(async (req, res) => {
  const memberships = await ProjectMember.find({ user: req.user._id, status: 'active' }).select('project');
  const projectIds = memberships.map((m) => m.project);

  const activity = await ActivityLog.find({ project: { $in: projectIds } })
    .populate('user', 'name avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

  successResponse(res, 200, 'Recent activity', activity);
});

// @desc    Get chart data (monthly expenses/funding)
// @route   GET /api/dashboard/charts
const getChartData = asyncHandler(async (req, res) => {
  const memberships = await ProjectMember.find({ user: req.user._id, status: 'active' }).select('project');
  const projectIds = memberships.map((m) => m.project);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [monthlyData, categoryData] = await Promise.all([
    Transaction.aggregate([
      { $match: { project: { $in: projectIds }, transactionDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$transactionDate' }, month: { $month: '$transactionDate' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Transaction.aggregate([
      { $match: { project: { $in: projectIds }, type: 'debit' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  successResponse(res, 200, 'Chart data', { monthlyData, categoryData });
});

// @desc    Get recent transactions across all user projects
// @route   GET /api/dashboard/transactions
const getRecentTransactions = asyncHandler(async (req, res) => {
  const memberships = await ProjectMember.find({ user: req.user._id, status: 'active' }).select('project');
  const projectIds = memberships.map((m) => m.project);

  const transactions = await Transaction.find({ project: { $in: projectIds } })
    .populate('project', 'name')
    .populate('performedBy', 'name')
    .sort({ transactionDate: -1 })
    .limit(10);

  successResponse(res, 200, 'Recent transactions', transactions);
});

module.exports = { getDashboardStats, getRecentActivity, getChartData, getRecentTransactions };
