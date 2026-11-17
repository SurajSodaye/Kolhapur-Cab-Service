// Vehicle Service - Kolhapur Cab Service
// Cloud Firestore Collection: 'vehicles'

import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { mockVehicles } from '../data/mockVehicles.js';

const STORAGE_KEY = 'kcs_vehicles_data';

/**
 * Fetch all vehicles with optional filters
 * Reads from Firestore collection 'vehicles', falling back to mockVehicles
 * @param {Object} [filter] - { category, minPassengers, isAvailable }
 * @returns {Promise<Array>}
 */
export async function getVehicles(filter = {}) {
  let vehicles = [];

  try {
    const snap = await getDocs(collection(db, 'vehicles'));
    if (!snap.empty) {
      vehicles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Vehicles fetch notice (using fallback):', err.message || err);
  }

  // Fallback if collection is not populated or offline
  if (vehicles.length === 0) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        vehicles = JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    if (!vehicles || vehicles.length === 0) {
      vehicles = [...mockVehicles];
    }
  }

  return vehicles.filter((v) => {
    if (filter.category && filter.category !== 'All' && v.category !== filter.category) {
      return false;
    }
    if (filter.minPassengers && v.capacity?.passengers < filter.minPassengers) {
      return false;
    }
    if (filter.isAvailable !== undefined && v.isAvailable !== filter.isAvailable) {
      return false;
    }
    return true;
  });
}

/**
 * Get a single vehicle by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getVehicleById(id) {
  try {
    const snap = await getDoc(doc(db, 'vehicles', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (err) {
    // Fallback
  }
  const vehicles = await getVehicles();
  return vehicles.find((v) => v.id === id) || null;
}

/**
 * Get featured or top vehicles for homepage display
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getFeaturedVehicles(limitCount = 4) {
  const vehicles = await getVehicles();
  return vehicles.slice(0, limitCount);
}

export default {
  getVehicles,
  getVehicleById,
  getFeaturedVehicles,
};
