const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

const initFirebaseAdmin = () => {
  if (initialized) return;
  try {
    // Check if the service account file exists
    const serviceAccountPath = path.join(__dirname, '..', 'fund-management-20ad5-firebase-adminsdk-fbsvc-2ca1536e50.json');
    if (!fs.existsSync(serviceAccountPath)) {
      console.log('[Firebase Admin] Service account file not found, skipping FCM initialization.');
      return;
    }
    
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log('[Firebase Admin] Initialized successfully');
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error.message);
  }
};

const getAdmin = () => {
  if (!initialized) initFirebaseAdmin();
  return initialized ? admin : null;
};

module.exports = { initFirebaseAdmin, getAdmin };
