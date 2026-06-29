const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

// @desc    Get all transactions for a project
// @route   GET /api/projects/:id/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
  const filter = { project: req.params.id };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = new Date(startDate);
    if (endDate) filter.transactionDate.$lte = new Date(endDate);
  }

  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .populate('performedBy', 'name email avatar')
    .populate('requestedBy', 'name')
    .populate('approvedBy', 'name')
    .populate('transferredBy', 'name')
    .populate('fundRequest', 'purpose category')
    .sort({ transactionDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  paginatedResponse(res, transactions, page, limit, total);
});

// @desc    Export transactions as JSON (frontend handles PDF/Excel/CSV)
// @route   GET /api/projects/:id/transactions/export
const exportTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, format = 'json' } = req.query;
  const filter = { project: req.params.id };
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.$gte = new Date(startDate);
    if (endDate) filter.transactionDate.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter)
    .populate('performedBy', 'name email')
    .populate('requestedBy', 'name')
    .populate('approvedBy', 'name')
    .populate('fundRequest', 'purpose category')
    .sort({ transactionDate: -1 });

  if (format === 'csv') {
    const rows = [
      'Transaction ID,Type,Amount,Category,Purpose,Performed By,Date,Remarks',
      ...transactions.map((t) =>
        `${t.transactionId},${t.type},${t.amount},${t.category},${t.purpose || ''},${t.performedBy?.name || ''},${new Date(t.transactionDate).toLocaleDateString('en-IN')},${t.remarks || ''}`
      ),
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    return res.send(rows.join('\n'));
  }

  successResponse(res, 200, 'Transactions exported', transactions);
});

module.exports = { getTransactions, exportTransactions };
