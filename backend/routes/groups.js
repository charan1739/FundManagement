const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { loadMembership, requireMember, requireAdmin } = require('../middleware/role');
const { upload } = require('../middleware/upload');

const { getMyGroups, createGroup, getGroup, deleteGroup } = require('../controllers/groupController');
const { getMembers, addMember, joinByCode, acceptInvite, declineInvite, removeMember, getPendingInvites } = require('../controllers/memberController');
const { addFunds, getTransactions, getActivity } = require('../controllers/fundController');
const { createRequest, getRequests } = require('../controllers/requestController');

router.use(protect);

// Group CRUD
router.get('/pending-invites', getPendingInvites);
router.get('/', getMyGroups);
router.post('/', createGroup);
router.post('/join', joinByCode); // join by group code

router.get('/:id', loadMembership, requireMember, getGroup);
router.delete('/:id', loadMembership, requireAdmin, deleteGroup);

// Members
router.get('/:id/members', loadMembership, requireMember, getMembers);
router.post('/:id/members', loadMembership, requireAdmin, addMember);
router.post('/:id/join', acceptInvite);
router.post('/:id/decline', declineInvite);
router.delete('/:id/members/:userId', loadMembership, requireAdmin, removeMember);

// Funds
router.post('/:id/funds', loadMembership, requireAdmin, upload.single('proof'), addFunds);
router.get('/:id/transactions', loadMembership, requireMember, getTransactions);
router.get('/:id/activity', loadMembership, requireMember, getActivity);

// Requests
router.post('/:id/requests', loadMembership, requireMember, upload.single('attachment'), createRequest);
router.get('/:id/requests', loadMembership, requireMember, getRequests);

module.exports = router;
