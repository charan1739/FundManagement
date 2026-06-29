const express = require('express');
const router = express.Router();
const { getProjects, createProject, getProject, updateProject, deleteProject, getProjectStats } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { anyMember, ownerOnly, requireProjectRole } = require('../middleware/role');
const { ROLES } = require('../config/constants');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(anyMember, getProject)
  .put(anyMember, requireProjectRole(ROLES.OWNER, ROLES.FINANCE_MANAGER), updateProject)
  .delete(ownerOnly, deleteProject);

router.get('/:id/stats', anyMember, getProjectStats);

module.exports = router;
