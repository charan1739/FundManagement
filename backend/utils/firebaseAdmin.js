const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

const initFirebaseAdmin = () => {
  if (initialized) return;
  try {
    let serviceAccount;

    // 1. Try to load from Environment Variable (Production / Render)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } 
    // 2. Fall back to local file (Local Development)
    else {
      const serviceAccountPath = path.join(__dirname, '..', 'fund-management-20ad5-firebase-adminsdk-fbsvc-2ca1536e50.json');
      if (!fs.existsSync(serviceAccountPath)) {
        console.log('[Firebase Admin] Service account not found in env or local file. Skipping FCM initialization.');
        return;
      }
      serviceAccount = require(serviceAccountPath);
    }
    
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
