/**
 * ==============================================================================
 * [DEPRECATED / OPTIONAL] Firebase Custom Claim Script
 * ==============================================================================
 * NOTE: As of the simplified Firestore-first authorization architecture, this
 * script is NO LONGER REQUIRED.
 * 
 * Admin authorization is now verified directly against the Cloud Firestore
 * collection: 'admins/{uid}' where:
 *   - role: "admin"
 *   - active: true
 * 
 * You do NOT need to download service account keys or run this script.
 * Simply create or verify your admin document in the Firebase Console:
 * Firestore Database -> admins -> Document ID = <YOUR_USER_UID>
 * ==============================================================================
 */
 * 
 * Safety & Security:
 * - Uses official Firebase Admin SDK (Node.js runtime only).
 * - Never runs in the browser or frontend client code.
 * - Requires a private service account JSON key downloaded from the Firebase Console.
 * - Verifies that the service account matches the target project 'cab-service-9ed9e'.
 * 
 * Usage Instructions:
 * -------------------
 * 1. Open Firebase Console: https://console.firebase.google.com/project/cab-service-9ed9e/settings/serviceaccounts/adminsdk
 * 2. Click "Generate new private key" to download the service account JSON.
 * 3. Place the downloaded file outside of git (or as service-account.json in root, which is in .gitignore).
 * 4. Install dependencies in the scripts folder:
 *      cd scripts
 *      npm install
 * 5. Run the script:
 *      node set-admin-claim.mjs --service-account ./service-account.json --email admin@gmail.com
 *    Or by UID:
 *      node set-admin-claim.mjs --service-account ./service-account.json --uid <USER_UID>
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import admin from 'firebase-admin';

const EXPECTED_PROJECT_ID = 'cab-service-9ed9e';

// Parse command line arguments
const args = process.argv.slice(2);
let serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || null;
let targetEmail = null;
let targetUid = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--service-account' && args[i + 1]) {
    serviceAccountPath = args[++i];
  } else if (args[i] === '--email' && args[i + 1]) {
    targetEmail = args[++i];
  } else if (args[i] === '--uid' && args[i + 1]) {
    targetUid = args[++i];
  }
}

// Default to admin@gmail.com if neither email nor UID is specified
if (!targetEmail && !targetUid) {
  targetEmail = 'admin@gmail.com';
}

console.log('='.repeat(65));
console.log('  Kolhapur Cab Service — Admin Custom Claim Setup Tool');
console.log('='.repeat(65));
console.log(`Target Firebase Project : ${EXPECTED_PROJECT_ID}`);
console.log(`Target Admin Account   : ${targetUid ? `UID: ${targetUid}` : `Email: ${targetEmail}`}`);
console.log('-'.repeat(65));

// 1. Validate service account path
if (!serviceAccountPath) {
  // Check common default locations
  const defaultLocations = [
    './service-account.json',
    '../service-account.json',
    './serviceAccountKey.json',
    '../serviceAccountKey.json'
  ];
  for (const loc of defaultLocations) {
    if (existsSync(loc)) {
      serviceAccountPath = loc;
      console.log(`Found default service account key at: ${loc}`);
      break;
    }
  }
}

if (!serviceAccountPath || !existsSync(serviceAccountPath)) {
  console.error('\n❌ ERROR: Service account file not found!');
  console.error('Please specify the path to your Firebase service account private key JSON:');
  console.error('  node set-admin-claim.mjs --service-account <path/to/key.json> --email admin@gmail.com\n');
  console.error('To download this file:');
  console.error(`1. Visit: https://console.firebase.google.com/project/${EXPECTED_PROJECT_ID}/settings/serviceaccounts/adminsdk`);
  console.error('2. Click "Generate new private key"');
  console.error('3. Save it securely on your machine (e.g. scripts/service-account.json)\n');
  process.exit(1);
}

try {
  const fullKeyPath = resolve(serviceAccountPath);
  const rawKeyData = readFileSync(fullKeyPath, 'utf8');
  const serviceAccount = JSON.parse(rawKeyData);

  // 2. Verify project ID matches expected project
  if (serviceAccount.project_id && serviceAccount.project_id !== EXPECTED_PROJECT_ID) {
    console.error(`\n❌ ERROR: Project ID mismatch!`);
    console.error(`  Expected project : ${EXPECTED_PROJECT_ID}`);
    console.error(`  Provided key is  : ${serviceAccount.project_id}`);
    console.error(`Please download the correct service account key for project '${EXPECTED_PROJECT_ID}'.\n`);
    process.exit(1);
  }

  // 3. Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: EXPECTED_PROJECT_ID
  });

  const auth = admin.auth();
  const db = admin.firestore();

  // 4. Find target user in Firebase Authentication
  console.log('\nSearching for user in Firebase Authentication...');
  let userRecord;
  try {
    if (targetUid) {
      userRecord = await auth.getUser(targetUid);
    } else {
      userRecord = await auth.getUserByEmail(targetEmail.trim());
    }
  } catch (userErr) {
    if (userErr.code === 'auth/user-not-found') {
      console.error(`\n❌ User not found in Firebase Authentication!`);
      console.error(`No account with ${targetUid ? `UID '${targetUid}'` : `email '${targetEmail}'`} exists in project '${EXPECTED_PROJECT_ID}'.`);
      console.error(`Please check the email or sign up first through the Firebase Console or login screen.\n`);
      process.exit(1);
    }
    throw userErr;
  }

  console.log('✓ Found user:');
  console.log(`  - UID           : ${userRecord.uid}`);
  console.log(`  - Email         : ${userRecord.email}`);
  console.log(`  - Email Verified: ${userRecord.emailVerified}`);
  console.log(`  - Existing Claims:`, JSON.stringify(userRecord.customClaims || {}));

  // 5. Assign admin custom claim
  const currentClaims = userRecord.customClaims || {};
  const updatedClaims = { ...currentClaims, admin: true };

  await auth.setCustomUserClaims(userRecord.uid, updatedClaims);
  console.log('\n✅ Successfully assigned custom claim: { admin: true }');

  // 6. Whitelist user in Firestore /admins/{uid} collection as a companion authority record
  const adminDocRef = db.collection('admins').doc(userRecord.uid);
  await adminDocRef.set({
    uid: userRecord.uid,
    email: userRecord.email,
    role: 'superadmin',
    active: true,
    grantedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  console.log(`✅ Synced admin record to Firestore collection '/admins/${userRecord.uid}'`);

  console.log('\n' + '='.repeat(65));
  console.log('  SUCCESS! Administrator privileges granted.');
  console.log('='.repeat(65));
  console.log('Next steps for the admin user:');
  console.log('1. Return to the Kolhapur Cab Service Admin Dashboard.');
  console.log('2. Click "Re-check Admin Permissions" (or sign out and log back in).');
  console.log('3. The fresh ID token containing { admin: true } will unlock the portal.\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Execution failed:', error.message);
  process.exit(1);
}
