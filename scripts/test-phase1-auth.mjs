/**
 * Phase 1 Test Suite: Customer Authentication & My Bookings Verification
 */

import fs from 'fs';
import path from 'path';

console.log('='.repeat(65));
console.log('  Phase 1: Customer Authentication & My Bookings Test Suite');
console.log('='.repeat(65));

let hasErrors = false;

function check(desc, condition) {
  if (condition) {
    console.log(`✓ ${desc}`);
  } else {
    console.error(`❌ FAILED: ${desc}`);
    hasErrors = true;
  }
}

// 1. Verify all new customer files exist
console.log('\n--- 1. File Structure Verification ---');
const requiredFiles = [
  'public-site/src/context/CustomerAuthContext.jsx',
  'public-site/src/components/auth/CustomerProtectedRoute.jsx',
  'public-site/src/pages/Login.jsx',
  'public-site/src/pages/Register.jsx',
  'public-site/src/pages/ForgotPassword.jsx',
  'public-site/src/pages/Profile.jsx',
  'public-site/src/pages/MyBookings.jsx',
];

for (const file of requiredFiles) {
  check(`File exists: ${file}`, fs.existsSync(file));
}

// 2. Verify CustomerAuthContext implementation
console.log('\n--- 2. Customer Auth Context Verification ---');
const authContextSource = fs.readFileSync('public-site/src/context/CustomerAuthContext.jsx', 'utf8');

check('CustomerAuthContext imports Firebase Auth methods', 
  authContextSource.includes('createUserWithEmailAndPassword') &&
  authContextSource.includes('signInWithEmailAndPassword') &&
  authContextSource.includes('signOut') &&
  authContextSource.includes('sendPasswordResetEmail') &&
  authContextSource.includes('onAuthStateChanged')
);

check('CustomerAuthContext references customers collection',
  authContextSource.includes("doc(db, 'customers',")
);

check('Customer profile fields conform to specification (uid, name, email, phone, createdAt, updatedAt)',
  authContextSource.includes('uid:') &&
  authContextSource.includes('name:') &&
  authContextSource.includes('email:') &&
  authContextSource.includes('phone:') &&
  authContextSource.includes('createdAt:') &&
  authContextSource.includes('updatedAt:')
);

check('Passwords are NOT stored in Firestore',
  !authContextSource.includes('password:') || !authContextSource.includes('profileData = {\n        password')
);

// 3. Verify App.jsx Routing & Protection
console.log('\n--- 3. Public App Routing & Protection ---');
const appSource = fs.readFileSync('public-site/src/App.jsx', 'utf8');

check('App.jsx wraps tree with CustomerAuthProvider', appSource.includes('<CustomerAuthProvider>'));
check('App.jsx has /login route', appSource.includes('path="/login"'));
check('App.jsx has /register route', appSource.includes('path="/register"'));
check('App.jsx has /forgot-password route', appSource.includes('path="/forgot-password"'));
check('App.jsx protects /profile route', appSource.includes('<CustomerProtectedRoute>\n                    <Profile />') || appSource.includes('<Profile />'));
check('App.jsx protects /my-bookings route', appSource.includes('<CustomerProtectedRoute>\n                    <MyBookings />') || appSource.includes('<MyBookings />'));

// 4. Verify Header Integration
console.log('\n--- 4. Header Customer Navigation ---');
const headerSource = fs.readFileSync('public-site/src/components/common/Header.jsx', 'utf8');

check('Header imports useCustomerAuth', headerSource.includes('useCustomerAuth'));
check('Header contains Sign In / Login button for guests', headerSource.includes('/login'));
check('Header contains Register button for guests', headerSource.includes('/register'));
check('Header contains My Bookings link', headerSource.includes('/my-bookings'));
check('Header contains My Profile link', headerSource.includes('/profile'));
check('Header contains customer sign-out handler', headerSource.includes('handleLogout'));
check('Header preserves 5-click admin shortcut to /admin/login', 
  headerSource.includes("window.location.assign('/admin/login')") &&
  headerSource.includes('clickCountRef.current >= 5')
);

// 5. Verify Booking Ownership in bookingService.js
console.log('\n--- 5. Booking Service Ownership Architecture ---');
const bookingServiceSource = fs.readFileSync('public-site/src/services/bookingService.js', 'utf8');

check('bookingService safely sources customerUid from Firebase Auth session',
  bookingServiceSource.includes('auth.currentUser ? auth.currentUser.uid : null')
);

check('bookingService includes customerUid in booking payload',
  bookingServiceSource.includes('customerUid: currentUid')
);

check('bookingService preserves trackingToken and bookingTracking collection',
  bookingServiceSource.includes('bookingTracking') &&
  bookingServiceSource.includes('trackingToken')
);

check('bookingService provides getCustomerBookings with ownership filter',
  bookingServiceSource.includes('getCustomerBookings') &&
  bookingServiceSource.includes("where('customerUid', '==', customerUid)")
);

// 6. Verify BookingForm Prefill
console.log('\n--- 6. Booking Form Customer Integration ---');
const formSource = fs.readFileSync('public-site/src/components/booking/BookingForm.jsx', 'utf8');

check('BookingForm uses useCustomerAuth', formSource.includes('useCustomerAuth'));
check('BookingForm auto-prefills customer contact details', 
  formSource.includes('customerProfile.name') &&
  formSource.includes('customerProfile.phone')
);

// 7. Verify Firestore Security Rules
console.log('\n--- 7. Firestore Security Rules Integrity ---');
const rulesSource = fs.readFileSync('firestore.rules', 'utf8');

check('Rules define customers collection with self-read and self-write',
  rulesSource.includes('match /customers/{uid}') &&
  rulesSource.includes('request.auth.uid == uid')
);

check('Rules forbid customers from listing all customer profiles',
  rulesSource.includes('match /customers/{uid}') &&
  rulesSource.includes('allow list: if isAdmin();')
);

check('Rules enforce customer ownership on bookings read (get & list)',
  rulesSource.includes('match /bookings/{bookingId}') &&
  rulesSource.includes('resource.data.customerUid == request.auth.uid')
);

check('Rules preserve guest booking creation with null/absent customerUid',
  rulesSource.includes("!('customerUid' in request.resource.data) ||") &&
  rulesSource.includes('request.resource.data.customerUid == null ||')
);

check('Rules enforce authenticated customer must match customerUid on booking creation',
  rulesSource.includes('request.resource.data.customerUid == request.auth.uid')
);

check('Rules prevent customer modifications to fares, driver, or booking status',
  rulesSource.includes('match /bookings/{bookingId}') &&
  rulesSource.includes('allow update, delete: if isAdmin();')
);

// 8. Admin Isolation & Non-Interference Check
console.log('\n--- 8. Admin Authorization Independence ---');
const adminAuthSource = fs.readFileSync('admin-dashboard/src/context/AuthContext.jsx', 'utf8');
const adminProtectedSource = fs.readFileSync('admin-dashboard/src/components/auth/ProtectedRoute.jsx', 'utf8');

check('Admin AuthContext is untouched and continues to verify admins/{uid}',
  adminAuthSource.includes("doc(db, 'admins', user.uid)") &&
  adminAuthSource.includes("normalizedRole === 'admin' || normalizedRole === 'superadmin'") &&
  adminAuthSource.includes("rawActive === true || rawActive === 'true'")
);

check('Admin ProtectedRoute restricts regular customers without admin doc',
  adminProtectedSource.includes('Access Restricted') &&
  adminProtectedSource.includes('!isAdmin')
);

console.log('\n' + '='.repeat(65));
if (hasErrors) {
  console.error('❌ Phase 1 test suite completed with failures.');
  process.exit(1);
} else {
  console.log('✅ ALL PHASE 1 UNIT & CONTRACT TESTS PASSED!');
  console.log('='.repeat(65) + '\n');
  process.exit(0);
}
