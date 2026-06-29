require('dotenv').config();
const mongoose = require('mongoose');

// Simple connectivity test
async function test() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('URI:', process.env.MONGO_URI?.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log('✅ Connected! Host:', mongoose.connection.host);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name).join(', ') || '(none)');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

test();
