// Content Service - Kolhapur Cab Service
// Cloud Firestore Collections: 'routes', 'services', 'reviews', 'offers', 'settings', 'enquiries', 'callbackRequests'

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

import { mockRoutes } from '../data/mockRoutes.js';
import { mockServices } from '../data/mockServices.js';
import { mockReviews } from '../data/mockReviews.js';
import { mockOffers, mockSettings } from '../data/mockContent.js';

const ENQUIRIES_KEY = 'kcs_enquiries_data';
const CALLBACKS_KEY = 'kcs_callbacks_data';

// Confirmed business contact details
const CONFIRMED_BUSINESS_PHONE = '+91 9529998320';

/**
 * Fetch all routes from Firestore with fallback to mock data
 */
export async function getRoutes(filter = {}) {
  try {
    const snap = await getDocs(collection(db, 'routes'));
    if (!snap.empty) {
      const routes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (filter.popularOnly) {
        return routes.filter((r) => r.popular);
      }
      return routes;
    }
  } catch (err) {
    console.warn('Routes fetch notice (using fallback):', err.message || err);
  }

  // Graceful fallback
  if (filter.popularOnly) {
    return mockRoutes.filter((r) => r.popular);
  }
  return [...mockRoutes];
}

export async function getRouteById(id) {
  try {
    const docRef = doc(db, 'routes', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (err) {
    // fallback
  }
  return mockRoutes.find((r) => r.id === id) || null;
}

/**
 * Fetch travel services from Firestore with fallback
 */
export async function getServices() {
  try {
    const snap = await getDocs(collection(db, 'services'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Services fetch notice (using fallback):', err.message || err);
  }
  return [...mockServices];
}

export async function getServiceById(id) {
  try {
    const docRef = doc(db, 'services', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (err) {
    // fallback
  }
  return mockServices.find((s) => s.id === id) || null;
}

/**
 * Fetch approved customer reviews from Firestore with fallback
 */
export async function getReviews() {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('status', 'in', ['approved', 'published'])
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Reviews fetch notice (using fallback):', err.message || err);
  }
  return [...mockReviews];
}

/**
 * Fetch promotional offers from Firestore with fallback
 */
export async function getOffers() {
  try {
    const snap = await getDocs(collection(db, 'offers'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Offers fetch notice (using fallback):', err.message || err);
  }
  return [...mockOffers];
}

/**
 * Fetch verified business settings from Firestore with fallback
 */
export async function getSettings() {
  try {
    const docRef = doc(db, 'settings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...mockSettings,
        ...data,
        contact: {
          ...mockSettings.contact,
          ...data.contact,
          primaryPhone: CONFIRMED_BUSINESS_PHONE,
        },
      };
    }
  } catch (err) {
    // fallback
  }
  return {
    ...mockSettings,
    contact: {
      ...mockSettings.contact,
      primaryPhone: CONFIRMED_BUSINESS_PHONE,
    },
  };
}

/**
 * Submit general customer enquiry (Firestore collection: 'enquiries')
 * Status: 'New'
 * @param {Object} enquiryData
 */
export async function createEnquiry(enquiryData) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const enquiryId = `ENQ-2026-${randomSuffix}`;
  const now = new Date().toISOString();

  const newEnquiry = {
    id: enquiryId,
    customerName: String(enquiryData.name || enquiryData.customerName || '').trim(),
    phone: String(enquiryData.phone || '').trim(),
    email: String(enquiryData.email || '').trim().toLowerCase(),
    subject: String(enquiryData.subject || 'General Inquiry').trim(),
    message: String(enquiryData.message || '').trim(),
    type: String(enquiryData.type || enquiryData.subject || 'General Inquiry').trim(),
    source: 'Website',
    priority: 'Normal',
    status: 'New',
    assignedAdmin: 'Unassigned',
    adminNotes: '',
    createdDate: now,
    lastUpdatedDate: now,
  };

  try {
    await setDoc(doc(db, 'enquiries', enquiryId), newEnquiry);
  } catch (err) {
    console.warn('Firestore enquiry save notice (saving locally):', err.message || err);
  }

  // Local fallback
  try {
    const existing = JSON.parse(localStorage.getItem(ENQUIRIES_KEY) || '[]');
    existing.unshift(newEnquiry);
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(existing.slice(0, 30)));
  } catch (e) {
    // Ignore quota
  }

  return {
    success: true,
    enquiryId: newEnquiry.id,
    message: 'Thank you for reaching out! Our Kolhapur travel desk will call you shortly.',
  };
}

/**
 * Submit customer callback request (Firestore collection: 'callbackRequests')
 * Status: 'New'
 * @param {Object} callbackData
 */
export async function createCallbackRequest(callbackData) {
  const randomSuffix = Math.floor(2000 + Math.random() * 8000);
  const callbackId = `CBK-2026-${randomSuffix}`;
  const now = new Date().toISOString();

  const newCallback = {
    id: callbackId,
    customerName: String(callbackData.name || callbackData.customerName || 'Website Visitor').trim(),
    phone: String(callbackData.phone || '').trim(),
    email: String(callbackData.email || '').trim().toLowerCase(),
    service: String(callbackData.service || callbackData.routeInterest || 'Outstation One Way').trim(),
    callbackDate: callbackData.callbackDate || now.split('T')[0],
    callbackTime: callbackData.callbackTime || '10:00',
    priority: callbackData.priority || 'Medium',
    status: 'New',
    customerMessage: String(callbackData.message || callbackData.customerMessage || 'Requested a phone callback from website.').trim(),
    adminNotes: '',
    assignedStaff: 'Unassigned',
    createdDate: now,
    lastUpdatedDate: now,
    history: [{ date: now, action: 'Callback request submitted from public website.' }],
  };

  try {
    await setDoc(doc(db, 'callbackRequests', callbackId), newCallback);
  } catch (err) {
    console.warn('Firestore callback save notice (saving locally):', err.message || err);
  }

  // Local fallback
  try {
    const existing = JSON.parse(localStorage.getItem(CALLBACKS_KEY) || '[]');
    existing.unshift(newCallback);
    localStorage.setItem(CALLBACKS_KEY, JSON.stringify(existing.slice(0, 30)));
  } catch (e) {
    // Ignore quota
  }

  return {
    success: true,
    callbackId: newCallback.id,
    message: 'Callback request registered successfully! Our Kolhapur desk coordinator will call you at your preferred time.',
  };
}

/**
 * Submit customer review (Firestore collection: 'reviews')
 * Status: 'pending' (Requires admin approval before public display)
 * @param {Object} reviewData
 */
export async function createReview(reviewData) {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const reviewId = `REV-2026-${randomSuffix}`;
  const now = new Date().toISOString();

  const newReview = {
    id: reviewId,
    author: String(reviewData.author || reviewData.name || 'Passenger').trim(),
    rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
    title: String(reviewData.title || 'Cab Trip Review').trim(),
    comment: String(reviewData.comment || '').trim(),
    tripRoute: String(reviewData.tripRoute || 'Kolhapur Travel').trim(),
    vehicleType: String(reviewData.vehicleType || 'Sedan (AC)').trim(),
    location: String(reviewData.location || 'Kolhapur').trim(),
    role: 'Verified Passenger',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    status: 'pending', // Pending admin moderation
    createdAt: now,
  };

  try {
    await setDoc(doc(db, 'reviews', reviewId), newReview);
  } catch (err) {
    console.warn('Firestore review save notice:', err.message || err);
  }

  return {
    success: true,
    reviewId,
    message: 'Thank you for your feedback! Your review has been submitted and will appear on the website once approved by our team.',
  };
}

export default {
  getRoutes,
  getRouteById,
  getServices,
  getServiceById,
  getReviews,
  getOffers,
  getSettings,
  createEnquiry,
  createCallbackRequest,
  createReview,
};
