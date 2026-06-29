const express = require('express');
const router = express.Router({ mergeParams: true });
const { getMembers, addMember, updateMemberRole, removeMember } = require('../controllers/memberController');
const { protect } = require('../middleware/auth');
const { anyMember, ownerOnly } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(anyMember, getMembers)
  .post(ownerOnly, addMember);

router.route('/:userId')
  .put(ownerOnly, updateMemberRole)
  .delete(ownerOnly, removeMember);

module.exports = router;
