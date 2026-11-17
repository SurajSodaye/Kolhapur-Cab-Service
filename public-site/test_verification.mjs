// Test verification script for Kolhapur Cab Service data contracts and services
import { getVehicles, getVehicleById, getFeaturedVehicles } from './src/services/vehicleService.js';
import { getRoutes, getServices, getReviews, getOffers, getSettings, createEnquiry } from './src/services/contentService.js';
import { createBooking, getBookingStatus, getAllMockBookings, updateMockBookingStatus } from './src/services/bookingService.js';

// Polyfill minimal localStorage for node environment
if (typeof localStorage === 'undefined') {
  let store = {};
  global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
}

async function runTests() {
  console.log('--- STARTING VERIFICATION TESTS ---');

  // Test 1: Vehicles
  console.log('\n[TEST 1] Testing Vehicle Service...');
  const allVehicles = await getVehicles();
  console.log(`✓ Fetched ${allVehicles.length} total vehicles`);
  if (allVehicles.length !== 6) throw new Error(`Expected 6 vehicles, got ${allVehicles.length}`);

  const sedans = await getVehicles({ category: 'Sedan' });
  console.log(`✓ Filtered ${sedans.length} Sedan(s)`);
  if (sedans.length < 1) throw new Error('Expected at least 1 Sedan');

  const dzire = await getVehicleById('veh-sedan-dzire');
  if (!dzire || dzire.name !== 'Maruti Dzire / Honda Amaze') throw new Error('Failed to find Dzire');
  console.log(`✓ Dzire vehicle found: ${dzire.name}, ₹${dzire.pricing.ratePerKm}/km`);

  const featured = await getFeaturedVehicles(4);
  console.log(`✓ Featured vehicles count: ${featured.length}`);

  // Test 2: Content Service
  console.log('\n[TEST 2] Testing Content Service...');
  const routes = await getRoutes();
  console.log(`✓ Fetched ${routes.length} routes from Kolhapur`);
  if (routes.length !== 8) throw new Error(`Expected 8 routes, got ${routes.length}`);

  const services = await getServices();
  console.log(`✓ Fetched ${services.length} services`);
  if (services.length !== 6) throw new Error(`Expected 6 services, got ${services.length}`);

  const reviews = await getReviews();
  console.log(`✓ Fetched ${reviews.length} customer testimonials`);

  const offers = await getOffers();
  console.log(`✓ Fetched ${offers.length} discount offers`);

  const settings = await getSettings();
  console.log(`✓ Fetched settings for brand: ${settings.companyName}, Phone: ${settings.contact.primaryPhone}`);

  const enquiryRes = await createEnquiry({
    name: 'Santosh Powar',
    phone: '9822011223',
    email: 'santosh@test.com',
    subject: 'Temple Darshan Tour',
    message: 'Need Innova Crysta for 6 persons to Mahalaxmi and Jyotiba on Sunday.'
  });
  console.log(`✓ Created enquiry: ${enquiryRes.enquiryId}, Status: ${enquiryRes.success}`);

  // Test 3: Booking Service & Status Lifecycle
  console.log('\n[TEST 3] Testing Booking Service & Shared Contract...');
  const initialBookings = await getAllMockBookings();
  console.log(`✓ Initial pre-seeded mock bookings: ${initialBookings.length}`);

  // Create a new booking
  const newBookingPayload = {
    tripType: 'one-way',
    pickupLocation: 'Rajarampuri 2nd Lane, Kolhapur',
    dropLocation: 'Pune Airport (PNQ)',
    pickupDate: '2026-11-20',
    pickupTime: '05:00',
    passengers: 3,
    luggage: 3,
    vehicleId: 'veh-sedan-dzire',
    vehicleName: 'Maruti Dzire',
    vehicleCategory: 'Sedan',
    customerName: 'Prashant Kadam',
    customerPhone: '+91 98221 99887',
    customerEmail: 'prashant.kadam@example.com',
    additionalNotes: 'Early morning flight at 10:15 AM'
  };

  const createRes = await createBooking(newBookingPayload);
  console.log(`✓ Created new booking: ${createRes.booking.id}`);
  console.log(`✓ Initial Status: ${createRes.booking.status} (Must be PENDING)`);
  if (createRes.booking.status !== 'PENDING') {
    throw new Error(`Expected PENDING status, got ${createRes.booking.status}`);
  }
  if (!createRes.booking.id.startsWith('KCS-2026-')) {
    throw new Error(`Invalid booking ID format: ${createRes.booking.id}`);
  }

  // Retrieve status by booking reference
  const fetchedStatus = await getBookingStatus(createRes.booking.id);
  if (!fetchedStatus) throw new Error('Could not find newly created booking by ID');
  console.log(`✓ Lookup by ID: Found booking for ${fetchedStatus.customerName}, Status: ${fetchedStatus.status}`);

  // Retrieve status by phone number
  const fetchedByPhone = await getBookingStatus('9822199887');
  if (!fetchedByPhone) throw new Error('Could not find booking by phone number');
  console.log(`✓ Lookup by Phone: Found booking reference ${fetchedByPhone.id}`);

  // Update status simulation (e.g. PENDING -> UNDER_REVIEW -> CONFIRMED -> DRIVER_ASSIGNED)
  const updatedToConfirmed = await updateMockBookingStatus(createRes.booking.id, 'CONFIRMED', 'Admin verified vehicle allocation.');
  console.log(`✓ Updated status: ${updatedToConfirmed.status}`);

  // Verify all required status contract values exist
  const validStatuses = [
    'PENDING', 'UNDER_REVIEW', 'QUOTED', 'CONFIRMED', 
    'DRIVER_ASSIGNED', 'COMPLETED', 'CANCELLED', 'REJECTED'
  ];
  for (const st of validStatuses) {
    const s = await updateMockBookingStatus(createRes.booking.id, st);
    if (!s || s.status !== st) throw new Error(`Status update failed for ${st}`);
  }
  console.log(`✓ All 8 shared status contract values verified: ${validStatuses.join(', ')}`);

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

