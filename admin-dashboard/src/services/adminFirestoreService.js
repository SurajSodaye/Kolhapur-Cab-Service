// Admin Firestore Service - Kolhapur Cab Service Operations Portal
// Real-time synchronization layer for administrative management modules

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

// ==========================================
// 1. BOOKINGS & TRACKING SYNCHRONIZATION
// ==========================================

/**
 * Real-time listener for bookings collection
 * @param {Function} callback - receives updated bookings array
 * @returns {Function} unsubscribe function
 */
export function subscribeBookings(callback) {
  try {
    const q = query(collection(db, 'bookings'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Real-time bookings listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Could not establish bookings listener:', err);
    return () => {};
  }
}

/**
 * Save or update a booking document and synchronize public tracking
 */
export async function saveBooking(booking) {
  const bookingId = booking.id;
  const now = new Date().toISOString();
  const payload = {
    ...booking,
    updatedAt: now,
  };

  // 1. Update private bookings collection
  await setDoc(doc(db, 'bookings', bookingId), payload, { merge: true });

  // 2. Synchronize public tracking document
  await syncTrackingDoc(bookingId, {
    status: payload.status,
    statusNotes: payload.statusNotes || '',
    driverDetails: payload.driverDetails || null,
    vehicleName: payload.vehicleName,
    vehicleCategory: payload.vehicleCategory,
    pickupLocation: payload.pickupLocation,
    dropLocation: payload.dropLocation,
    pickupDate: payload.pickupDate,
    pickupTime: payload.pickupTime,
    returnDate: payload.returnDate || null,
    estimatedFare: payload.estimatedFare,
    updatedAt: now,
  });

  return payload;
}

/**
 * Update booking status and propagate to public tracking
 */
export async function updateBookingStatus(bookingId, status, statusNotes = '') {
  const now = new Date().toISOString();
  const updateData = {
    status,
    statusNotes,
    updatedAt: now,
  };

  await updateDoc(doc(db, 'bookings', bookingId), updateData).catch(async () => {
    // If updateDoc fails (e.g. doc doesn't exist), setDoc with merge
    await setDoc(doc(db, 'bookings', bookingId), updateData, { merge: true });
  });

  await syncTrackingDoc(bookingId, {
    status,
    statusNotes,
    updatedAt: now,
  });
}

/**
 * Assign chauffeur and vehicle to booking
 */
export async function assignDriver(bookingId, driverDetails, statusNotes = '') {
  const now = new Date().toISOString();
  const updateData = {
    status: 'DRIVER_ASSIGNED',
    driver: driverDetails.name,
    vehicle: driverDetails.vehicleReg,
    driverDetails,
    statusNotes,
    updatedAt: now,
  };

  await updateDoc(doc(db, 'bookings', bookingId), updateData).catch(async () => {
    await setDoc(doc(db, 'bookings', bookingId), updateData, { merge: true });
  });

  await syncTrackingDoc(bookingId, {
    status: 'DRIVER_ASSIGNED',
    driverDetails,
    statusNotes,
    updatedAt: now,
  });
}

/**
 * Delete a booking and its tracking document
 */
export async function deleteBooking(bookingId) {
  await deleteDoc(doc(db, 'bookings', bookingId)).catch(() => {});
  try {
    const q = query(collection(db, 'bookingTracking'), where('bookingId', '==', bookingId));
    const snap = await getDocs(q);
    snap.forEach((d) => deleteDoc(d.ref));
  } catch (err) {
    // Ignore
  }
}

/**
 * Helper to update corresponding tracking document
 */
async function syncTrackingDoc(bookingId, updates) {
  try {
    const q = query(collection(db, 'bookingTracking'), where('bookingId', '==', bookingId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(snap.docs[0].ref, updates);
    }
  } catch (err) {
    console.warn('Could not sync tracking doc:', err.message || err);
  }
}

// ==========================================
// 2. CUSTOMER ENQUIRIES
// ==========================================

export function subscribeEnquiries(callback) {
  try {
    return onSnapshot(
      collection(db, 'enquiries'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Enquiries listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveEnquiry(enquiry) {
  const enquiryId = enquiry.id;
  await setDoc(doc(db, 'enquiries', enquiryId), enquiry, { merge: true });
  return enquiry;
}

export async function updateEnquiryStatus(enquiryId, status, adminNotes = '') {
  const now = new Date().toISOString();
  await updateDoc(doc(db, 'enquiries', enquiryId), {
    status,
    adminNotes,
    lastUpdatedDate: now,
  }).catch(async () => {
    await setDoc(doc(db, 'enquiries', enquiryId), { status, adminNotes, lastUpdatedDate: now }, { merge: true });
  });
}

export async function deleteEnquiry(enquiryId) {
  await deleteDoc(doc(db, 'enquiries', enquiryId)).catch(() => {});
}

// ==========================================
// 3. CALLBACK REQUESTS
// ==========================================

export function subscribeCallbackRequests(callback) {
  try {
    return onSnapshot(
      collection(db, 'callbackRequests'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('CallbackRequests listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveCallbackRequest(req) {
  const reqId = req.id;
  await setDoc(doc(db, 'callbackRequests', reqId), req, { merge: true });
  return req;
}

export async function updateCallbackStatus(reqId, status, adminNotes = '', assignedStaff = '') {
  const now = new Date().toISOString();
  const updatePayload = {
    status,
    adminNotes,
    lastUpdatedDate: now,
  };
  if (assignedStaff) updatePayload.assignedStaff = assignedStaff;

  await updateDoc(doc(db, 'callbackRequests', reqId), updatePayload).catch(async () => {
    await setDoc(doc(db, 'callbackRequests', reqId), updatePayload, { merge: true });
  });
}

export async function deleteCallbackRequest(reqId) {
  await deleteDoc(doc(db, 'callbackRequests', reqId)).catch(() => {});
}

// ==========================================
// 4. REVIEWS MODERATION
// ==========================================

export function subscribeReviews(callback) {
  try {
    return onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Reviews listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveReview(review) {
  const reviewId = review.id;
  await setDoc(doc(db, 'reviews', reviewId), review, { merge: true });
  return review;
}

export async function updateReviewStatus(reviewId, status) {
  await updateDoc(doc(db, 'reviews', reviewId), { status }).catch(async () => {
    await setDoc(doc(db, 'reviews', reviewId), { status }, { merge: true });
  });
}

export async function deleteReview(reviewId) {
  await deleteDoc(doc(db, 'reviews', reviewId)).catch(() => {});
}

// ==========================================
// 5. VEHICLE FLEET & DRIVERS
// ==========================================

export function subscribeVehicles(callback) {
  try {
    return onSnapshot(
      collection(db, 'vehicles'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Vehicles listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveVehicle(vehicle) {
  const vehicleId = vehicle.id;
  await setDoc(doc(db, 'vehicles', vehicleId), vehicle, { merge: true });
  return vehicle;
}

export async function deleteVehicle(vehicleId) {
  await deleteDoc(doc(db, 'vehicles', vehicleId)).catch(() => {});
}

export function subscribeDrivers(callback) {
  try {
    return onSnapshot(
      collection(db, 'drivers'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Drivers listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveDriver(driver) {
  const driverId = driver.id;
  await setDoc(doc(db, 'drivers', driverId), driver, { merge: true });
  return driver;
}

export async function deleteDriver(driverId) {
  await deleteDoc(doc(db, 'drivers', driverId)).catch(() => {});
}

// ==========================================
// 6. ROUTES, SERVICES & OFFERS
// ==========================================

export function subscribeRoutes(callback) {
  try {
    return onSnapshot(
      collection(db, 'routes'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Routes listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveRoute(route) {
  const routeId = route.id;
  await setDoc(doc(db, 'routes', routeId), route, { merge: true });
  return route;
}

export async function deleteRoute(routeId) {
  await deleteDoc(doc(db, 'routes', routeId)).catch(() => {});
}

export function subscribeServices(callback) {
  try {
    return onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Services listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveService(service) {
  const serviceId = service.id;
  await setDoc(doc(db, 'services', serviceId), service, { merge: true });
  return service;
}

export async function deleteService(serviceId) {
  await deleteDoc(doc(db, 'services', serviceId)).catch(() => {});
}

export function subscribeOffers(callback) {
  try {
    return onSnapshot(
      collection(db, 'offers'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(items);
      },
      (error) => {
        console.warn('Offers listener notice:', error.message || error);
        callback([]);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveOffer(offer) {
  const offerId = offer.id;
  await setDoc(doc(db, 'offers', offerId), offer, { merge: true });
  return offer;
}

export async function deleteOffer(offerId) {
  await deleteDoc(doc(db, 'offers', offerId)).catch(() => {});
}

// ==========================================
// 7. BUSINESS SETTINGS
// ==========================================

export async function getAdminSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'general'));
    if (snap.exists()) return snap.data();
  } catch (err) {
    console.warn('Settings fetch notice:', err.message || err);
  }
  return null;
}

export async function saveAdminSettings(settings) {
  await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
  return settings;
}
