const mongoose = require('mongoose');
const connectDB = require('../config/db');
const GroupMember = require('../models/GroupMember');

require('dotenv').config({ path: '../.env' });

(async () => {
  await connectDB();
  const m = await GroupMember.findOne({ _id: '6a4101149783408a4880bc89' }); // I don't have the exact ID of membership. Let's find by group name.
  const Group = require('../models/Group');
  const g = await Group.findOne({ name: 'Office Supplies Fund' });
  const mem = await GroupMember.find({ group: g._id }).populate('user');
  console.log(JSON.stringify(mem, null, 2));
  process.exit(0);
})();
