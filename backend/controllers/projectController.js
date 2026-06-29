const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { generateProjectCode } = require('../utils/generateCode');
const { logActivity } = require('../services/reportService');
const { ROLES, PROJECT_STATUS } = require('../config/constants');

// @desc    Get all projects for current user
// @route   GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 12 } = req.query;

  // Find all project memberships for current user
  const memberships = await ProjectMember.find({ user: req.user._id, status: 'active' }).select('project');
  const projectIds = memberships.map((m) => m.project);

  const filter = { _id: { $in: projectIds } };
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .populate('owner', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Attach user's role to each project
  const membershipMap = {};
  const fullMemberships = await ProjectMember.find({ user: req.user._id, project: { $in: projectIds } });
  fullMemberships.forEach((m) => { membershipMap[m.project.toString()] = m.role; });

  const projectsWithRole = projects.map((p) => ({
    ...p.toObject(),
    myRole: membershipMap[p._id.toString()],
  }));

  paginatedResponse(res, projectsWithRole, page, limit, total);
});

// @desc    Create project
// @route   POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Project name is required' });

  let code;
  let exists = true;
  while (exists) {
    code = generateProjectCode();
    exists = await Project.exists({ code });
  }

  const project = await Project.create({ name, description, code, owner: req.user._id });

  // Auto-add creator as owner member
  await ProjectMember.create({
    project: project._id,
    user: req.user._id,
    role: ROLES.OWNER,
    addedBy: req.user._id,
  });

  await logActivity({
    project: project._id,
    user: req.user._id,
    action: `${req.user.name} created project "${project.name}"`,
    actionType: 'project_created',
    metadata: { projectCode: code },
    ip: req.ip,
  });

  const populated = await Project.findById(project._id).populate('owner', 'name email avatar');
  successResponse(res, 201, 'Project created successfully', populated);
});

// @desc    Get single project
// @route   GET /api/projects/:id
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner', 'name email avatar');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const pendingTotal = await require('../models/FundRequest').aggregate([
    { $match: { project: project._id, status: { $in: ['pending', 'approved', 'transferred'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const data = {
    ...project.toObject(),
    myRole: req.projectMember?.role,
    pendingRequestsTotal: pendingTotal[0]?.total || 0,
  };

  successResponse(res, 200, 'Project fetched', data);
});

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (status && Object.values(PROJECT_STATUS).includes(status)) project.status = status;

  await project.save();

  await logActivity({
    project: project._id,
    user: req.user._id,
    action: `${req.user.name} updated project "${project.name}"`,
    actionType: 'project_updated',
    ip: req.ip,
  });

  successResponse(res, 200, 'Project updated', project);
});

// @desc    Delete project (owner only)
// @route   DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  if (project.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only project owner can delete this project' });
  }

  await project.deleteOne();
  // Clean up memberships
  await ProjectMember.deleteMany({ project: project._id });

  successResponse(res, 200, 'Project deleted successfully');
});

// @desc    Get project stats
// @route   GET /api/projects/:id/stats
const getProjectStats = asyncHandler(async (req, res) => {
  const FundRequest = require('../models/FundRequest');
  const Transaction = require('../models/Transaction');

  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const [memberCount, pendingCount, approvedCount, completedCount, totalFundsAdded] = await Promise.all([
    ProjectMember.countDocuments({ project: projectId, status: 'active' }),
    FundRequest.countDocuments({ project: projectId, status: 'pending' }),
    FundRequest.countDocuments({ project: projectId, status: 'approved' }),
    FundRequest.countDocuments({ project: projectId, status: 'completed' }),
    Transaction.aggregate([
      { $match: { project: project._id, type: 'credit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  successResponse(res, 200, 'Project stats fetched', {
    memberCount,
    pendingCount,
    approvedCount,
    completedCount,
    totalFundsAdded: totalFundsAdded[0]?.total || 0,
    currentBalance: project.currentBalance,
    allocatedBalance: project.allocatedBalance,
    availableBalance: project.currentBalance - project.allocatedBalance,
  });
});

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, getProjectStats };
