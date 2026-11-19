// Booking Service - Kolhapur Cab Service
// Cloud Firestore Collections: 'bookings' (Private Admin & Customer) & 'bookingTracking' (Unguessable Public Tracking)

import { doc, setDoc, getDoc, getDocs, collection, query, where, limit } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase.js';
import { mockBookings } from '../data/mockBookings.js';

const BOOKINGS_STORAGE_KEY = 'kcs_bookings_data';

/**
 * Generate cryptographically unguessable tracking token for public status lookup
 */
function generateTrackingToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return (crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).substring(2, 10)).toLowerCase();
  }
  return (Date.now().toString(36) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).toLowerCase();
}

/**
 * Generate human-readable Kolhapur Cab Service booking reference
 * Format: KCS-2026-XXXXX
 */
export function generateBookingReference() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `KCS-2026-${randomNum}`;
}

/**
 * Helper to get local fallback bookings (for preview/dev resilience)
 */
function getLocalFallbackBookings() {
  try {
    const data = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return [...mockBookings];
}

/**
 * Create a new customer cab booking request in Cloud Firestore
 *
 * Security Requirement:
 * CUSTOMER LOGIN IS STRICTLY COMPULSORY.
 * Guest booking is blocked. If no authenticated Firebase user exists, reject the request.
 * customerUid is ALWAYS derived from auth.currentUser.uid (never from an untrusted form field).
 *
 * @param {Object} rawData
 * @returns {Promise<{success: boolean, booking: Object, trackingToken: string, message: string}>}
 */
export async function createBooking(rawData) {
  // 1. Mandatory customer authentication check
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.uid) {
    throw new Error('Please log in to book a cab.');
  }

  const currentUid = currentUser.uid;
  const referenceId = generateBookingReference();
  const trackingToken = generateTrackingToken();
  const now = new Date().toISOString();

  // Construct full booking document
  const newBooking = {
    id: referenceId,
    trackingToken,
    customerUid: currentUid,
    tripType: rawData.tripType || 'one-way',
    pickupLocation: String(rawData.pickupLocation || '').trim(),
    dropLocation: String(rawData.dropLocation || '').trim(),
    pickupDate: rawData.pickupDate,
    pickupTime: rawData.pickupTime,
    returnDate: rawData.tripType === 'round-trip' ? (rawData.returnDate || null) : null,
    passengers: Number(rawData.passengers) || 1,
    luggage: Number(rawData.luggage) || 0,
    vehicleId: rawData.vehicleId || 'veh-sedan-dzire',
    vehicleName: rawData.vehicleName || 'Sedan (Dzire / Etios)',
    vehicleCategory: rawData.vehicleCategory || 'Sedan',
    customerName: String(rawData.customerName || '').trim(),
    customerPhone: String(rawData.customerPhone || '').trim(),
    customerEmail: String(rawData.customerEmail || '').trim().toLowerCase(),
    additionalNotes: String(rawData.additionalNotes || '').trim(),
    estimatedDistanceKm: Number(rawData.estimatedDistanceKm) || 200,
    estimatedFare: Number(rawData.estimatedFare) || 3000,
    baseFare: Number(rawData.baseFare) || 3000,
    status: 'PENDING',
    statusNotes: 'Your booking request has been safely received. Our Kolhapur dispatch desk is checking vehicle allocation and will call you within 15-30 minutes with final confirmation.',
    driverDetails: null,
    createdAt: now,
    updatedAt: now,
  };

  // Construct public tracking document (Strictly limited details - No customer private PII)
  const trackingData = {
    id: referenceId,
    bookingId: referenceId,
    trackingToken,
    tripType: newBooking.tripType,
    pickupLocation: newBooking.pickupLocation,
    dropLocation: newBooking.dropLocation,
    pickupDate: newBooking.pickupDate,
    pickupTime: newBooking.pickupTime,
    returnDate: newBooking.returnDate,
    passengers: newBooking.passengers,
    vehicleCategory: newBooking.vehicleCategory,
    vehicleName: newBooking.vehicleName,
    estimatedFare: newBooking.estimatedFare,
    status: 'PENDING',
    statusNotes: newBooking.statusNotes,
    driverDetails: null,
    createdAt: now,
    updatedAt: now,
  };

  let savedToFirestore = false;

  // 1. Primary: Save directly to Cloud Firestore
  try {
    // Write full booking to 'bookings' collection
    await setDoc(doc(db, 'bookings', referenceId), newBooking);

    // Write public tracking record to 'bookingTracking' collection
    await setDoc(doc(db, 'bookingTracking', trackingToken), trackingData);

    savedToFirestore = true;
  } catch (firestoreError) {
    console.warn('Firestore booking save notice (falling back gracefully):', firestoreError.message || firestoreError);
  }

  // 2. Fallback / local mirror so browser keeps offline continuity
  try {
    const existing = getLocalFallbackBookings();
    existing.unshift(newBooking);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    // Ignore quota issues
  }

  return {
    success: true,
    savedToFirestore,
    booking: newBooking,
    trackingToken,
    message: 'Booking request placed successfully with status PENDING. Awaiting Kolhapur dispatch desk confirmation.',
  };
}

/**
 * Fetch all bookings belonging strictly to an authenticated customer
 * Enforces ownership constraint: where('customerUid', '==', customerUid)
 *
 * @param {string} customerUid
 * @returns {Promise<Array>}
 */
export async function getCustomerBookings(customerUid) {
  if (!customerUid) return [];

  try {
    const q = query(
      collection(db, 'bookings'),
      where('customerUid', '==', customerUid)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // In-memory sort by createdAt descending (ensures resilience without requiring pre-warmed composite indexes)
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return items;
  } catch (err) {
    console.error('Error fetching customer bookings from Firestore:', err);
    throw err;
  }
}

/**
 * Retrieve booking status by unguessable tracking token, Reference ID, or mobile number
 * @param {string} queryStr
 * @returns {Promise<Object|null>}
 */
export async function getBookingStatus(queryStr) {
  if (!queryStr) return null;

  const normalized = String(queryStr).trim();
  const upperQuery = normalized.toUpperCase();

  // 1. Try Firestore bookingTracking direct token lookup
  try {
    const trackingDocRef = doc(db, 'bookingTracking', normalized.toLowerCase());
    const trackingSnap = await getDoc(trackingDocRef);
    if (trackingSnap.exists()) {
      return { ...trackingSnap.data(), source: 'firestore' };
    }
  } catch (err) {
    // Tracking collection read error or token mismatch
  }

  // 2. Try Firestore bookingTracking query by bookingId (e.g. KCS-2026-1001)
  try {
    const q = query(
      collection(db, 'bookingTracking'),
      where('bookingId', '==', upperQuery),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { ...snap.docs[0].data(), source: 'firestore' };
    }
  } catch (err) {
    // Ignore and proceed to fallback
  }

  // 3. Fallback to local / mock bookings for demonstration & testing
  const fallbackList = getLocalFallbackBookings();
  const digitsOnly = normalized.replace(/\D/g, '');

  let match = fallbackList.find((b) => b.id?.toUpperCase() === upperQuery || b.trackingToken === normalized);

  if (!match && digitsOnly.length >= 8) {
    match = fallbackList.find((b) => {
      const bDigits = String(b.customerPhone || '').replace(/\D/g, '');
      return bDigits.endsWith(digitsOnly) || digitsOnly.endsWith(bDigits);
    });
  }

  return match || null;
}

/**
 * Get all mock bookings (useful for demo & preview switcher)
 * @returns {Promise<Array>}
 */
export async function getAllMockBookings() {
  return getLocalFallbackBookings();
}

/**
 * Update mock booking status (useful for demo testing controls)
 * @param {string} bookingId
 * @param {string} newStatus
 * @param {string} [notes]
 */
export async function updateMockBookingStatus(bookingId, newStatus, notes = '') {
  const bookings = getLocalFallbackBookings();
  const index = bookings.findIndex((b) => b.id === bookingId);
  if (index !== -1) {
    bookings[index].status = newStatus;
    if (notes) bookings[index].statusNotes = notes;
    bookings[index].updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      // Ignore
    }
    return bookings[index];
  }
  return null;
}

export default {
  createBooking,
  getCustomerBookings,
  getBookingStatus,
  getAllMockBookings,
  updateMockBookingStatus,
  generateBookingReference,
};
