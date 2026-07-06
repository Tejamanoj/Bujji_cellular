/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDjnpSHtCo2j-4qBcfnddCl7_kJMY7j9Cw",
  authDomain: "bujjicellulars-1389e.firebaseapp.com",
  projectId: "bujjicellulars-1389e",
  storageBucket: "bujjicellulars-1389e.firebasestorage.app",
  messagingSenderId: "507176209291",
  appId: "1:507176209291:web:7ea13406a209153cee7d8e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function recoverAll() {
  const adminEmails = ['admin@bujjicellular.com', 'admin@bujjicellulars.com'];

  for (const email of adminEmails) {
    console.log(`🚀 Checking Admin Credentials for: ${email}...`);
    let uid = '';
    
    try {
      const cred = await signInWithEmailAndPassword(auth, email, 'Admin@123');
      uid = cred.user.uid;
      console.log(`✅ Admin Authenticated. UID: ${uid}`);
    } catch (err) {
      console.log(`ℹ️ SignIn failed: ${err.message} - Trying to create new user...`);
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, 'Admin@123');
        uid = cred.user.uid;
        console.log(`✅ Admin Registered. UID: ${uid}`);
      } catch (createErr) {
        console.error(`❌ Failed to register admin: ${createErr.message}`);
      }
    }

    if (uid) {
      await setDoc(doc(db, 'admin_users', uid), {
        email: email,
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Updated admin_users mapping document for ${email} in Firestore.`);
    }
  }
  process.exit(0);
}

recoverAll();
