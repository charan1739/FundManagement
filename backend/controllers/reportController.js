const Transaction = require('../models/Transaction');
const FundRequest = require('../models/FundRequest');
const ProjectMember = require('../models/ProjectMember');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get project summary report
// @route   GET /api/projects/:id/reports/summary
const getProjectSummary = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const project = await Project.findById(projectId).populate('owner', 'name email');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const [totalAdded, totalSpent, byCategory, byMember, pendingTotal] = await Promise.all([
    Transaction.aggregate([{ $match: { project: project._id, type: 'credit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { project: project._id, type: 'debit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([
      { $match: { project: project._id, type: 'debit' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    FundRequest.aggregate([
      { $match: { project: project._id, status: 'completed' } },
      { $group: { _id: '$requestedBy', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { total: 1, count: 1, 'user.name': 1, 'user.email': 1 } },
      { $sort: { total: -1 } },
    ]),
    FundRequest.aggregate([{ $match: { project: project._id, status: { $in: ['pending', 'approved', 'transferred'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  successResponse(res, 200, 'Project summary', {
    project: { name: project.name, code: project.code, status: project.status, owner: project.owner },
    totalAdded: totalAdded[0]?.total || 0,
    totalSpent: totalSpent[0]?.total || 0,
    currentBalance: project.currentBalance,
    pendingTotal: pendingTotal[0]?.total || 0,
    byCategory,
    byMember,
  });
});

// @desc    Get monthly expense report
// @route   GET /api/projects/:id/reports/monthly
const getMonthlyReport = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const data = await Transaction.aggregate([
    { $match: { project: project._id, transactionDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
    { $group: { _id: { month: { $month: '$transactionDate' }, type: '$type' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { '_id.month': 1 } },
  ]);

  successResponse(res, 200, 'Monthly report', { year, data });
});

module.exports = { getProjectSummary, getMonthlyReport };
