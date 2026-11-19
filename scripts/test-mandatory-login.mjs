/**
 * Master Verification Suite: Mandatory Customer Login Before Booking
 * 
 * Verifies:
 * 1. bookingService.js enforces mandatory customer login (rejects unauthenticated requests).
 * 2. firestore.rules strictly forbids guest booking and enforces customerUid == request.auth.uid.
 * 3. BookingForm.jsx checks customer authentication, displays login requirements, and preserves booking draft.
 * 4. Login.jsx & Register.jsx restore bookingDraft and navigate back to /booking.
 * 5. Admin dashboard authentication remains completely isolated and intact.
 */

import fs from 'fs';

console.log('='.repeat(70));
console.log('  Mandatory Customer Login & Security Rules Verification Suite');
console.log('='.repeat(70));

let hasErrors = false;

function check(desc, condition) {
  if (condition) {
    console.log(`✓ ${desc}`);
  } else {
    console.error(`❌ FAILED: ${desc}`);
    hasErrors = true;
  }
}

// 1. Service Layer Enforcement
console.log('\n--- 1. bookingService.js Mandatory Auth Enforcement ---');
const bookingServiceSrc = fs.readFileSync('public-site/src/services/bookingService.js', 'utf8');

check('bookingService checks auth.currentUser',
  bookingServiceSrc.includes('const currentUser = auth.currentUser;')
);

check('bookingService throws error if currentUser is null/unauthenticated',
  bookingServiceSrc.includes('if (!currentUser || !currentUser.uid)') &&
  bookingServiceSrc.includes("throw new Error('Please log in to book a cab.');")
);

check('bookingService derives customerUid strictly from currentUser.uid',
  bookingServiceSrc.includes('const currentUid = currentUser.uid;') &&
  bookingServiceSrc.includes('customerUid: currentUid')
);

// 2. Firestore Security Rules Enforcement
console.log('\n--- 2. Firestore Security Rules Enforcement ---');
const firestoreRulesSrc = fs.readFileSync('firestore.rules', 'utf8');

check('Firestore rules require isAuthenticated() for bookings create',
  firestoreRulesSrc.includes('match /bookings/{bookingId}') &&
  firestoreRulesSrc.includes('allow create: if isAuthenticated()')
);

check('Firestore rules enforce customerUid matches request.auth.uid',
  firestoreRulesSrc.includes('request.resource.data.customerUid == request.auth.uid')
);

check('Firestore rules completely prohibit guest booking (no guest null check)',
  !firestoreRulesSrc.includes("!('customerUid' in request.resource.data) || request.resource.data.customerUid == null")
);

check('Firestore rules require isAuthenticated() for bookingTracking create',
  firestoreRulesSrc.includes('match /bookingTracking/{trackingToken}') &&
  firestoreRulesSrc.includes('allow create: if isAuthenticated() && request.resource.data.status == \'PENDING\';')
);

check('Firestore rules restrict customer booking reads strictly to their own customerUid',
  firestoreRulesSrc.includes('allow get: if isAdmin() || (isAuthenticated() && resource.data.customerUid == request.auth.uid);') &&
  firestoreRulesSrc.includes('allow list: if isAdmin() || (isAuthenticated() && resource.data.customerUid == request.auth.uid);')
);

// 3. BookingForm UI & Redirect Behavior
console.log('\n--- 3. BookingForm.jsx UI & Redirect Enforcement ---');
const bookingFormSrc = fs.readFileSync('public-site/src/components/booking/BookingForm.jsx', 'utf8');

check('BookingForm imports useCustomerAuth',
  bookingFormSrc.includes('useCustomerAuth') &&
  bookingFormSrc.includes('currentCustomer')
);

check('BookingForm checks !currentCustomer before form submission',
  bookingFormSrc.includes('if (!currentCustomer)')
);

check('BookingForm packages draft and navigates to /login with state',
  bookingFormSrc.includes("navigate('/login', {") &&
  bookingFormSrc.includes("from: '/booking'") &&
  bookingFormSrc.includes('bookingDraft: draft')
);

check('BookingForm displays login required banner when unauthenticated',
  bookingFormSrc.includes('Customer Account Required') ||
  bookingFormSrc.includes('Customer Login Required')
);

check('BookingForm adapts submit button to reflect sign in requirement',
  bookingFormSrc.includes('Sign In to Confirm Cab Booking') ||
  bookingFormSrc.includes('Sign In to Book Cab')
);

check('BookingForm displays restored draft notice banner',
  bookingFormSrc.includes('initialState.notice')
);

// 4. Login & Register State Restoration
console.log('\n--- 4. Login & Register Draft Restoration ---');
const loginSrc = fs.readFileSync('public-site/src/pages/Login.jsx', 'utf8');
const registerSrc = fs.readFileSync('public-site/src/pages/Register.jsx', 'utf8');

check('Login.jsx reads bookingDraft from location.state',
  loginSrc.includes('location.state?.bookingDraft')
);

check('Login.jsx restores bookingDraft upon successful sign in',
  loginSrc.includes('...bookingDraft') &&
  loginSrc.includes('navigate(destinationPath,')
);

check('Register.jsx reads bookingDraft from location.state',
  registerSrc.includes('location.state?.bookingDraft')
);

check('Register.jsx restores bookingDraft upon successful registration',
  registerSrc.includes('...bookingDraft') &&
  registerSrc.includes('navigate(destinationPath,')
);

check('Register.jsx passes location.state to Sign In link',
  registerSrc.includes('state={location.state}')
);

// 5. Admin Dashboard Non-Interference
console.log('\n--- 5. Admin Dashboard Security Independence ---');
const adminAuthSrc = fs.readFileSync('admin-dashboard/src/context/AuthContext.jsx', 'utf8');
const adminProtectedSrc = fs.readFileSync('admin-dashboard/src/components/auth/ProtectedRoute.jsx', 'utf8');

check('Admin AuthContext is completely isolated from customer auth',
  adminAuthSrc.includes("doc(db, 'admins', user.uid)") &&
  adminAuthSrc.includes("normalizedRole === 'admin' || normalizedRole === 'superadmin'")
);

check('Admin ProtectedRoute continues to restrict non-admins',
  adminProtectedSrc.includes('Access Restricted') &&
  adminProtectedSrc.includes('!isAdmin')
);

console.log('\n' + '='.repeat(70));
if (hasErrors) {
  console.error('❌ Verification suite failed with errors.');
  process.exit(1);
} else {
  console.log('✅ ALL MANDATORY LOGIN & SECURITY CHECKS PASSED SUCCESSFULLY!');
  console.log('='.repeat(70) + '\n');
  process.exit(0);
}
