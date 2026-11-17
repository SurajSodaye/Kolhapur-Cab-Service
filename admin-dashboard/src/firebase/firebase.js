import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Defensive helper to ensure environment variable values are clean and unquoted
 */
const sanitizeEnv = (val) => {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

/**
 * Firebase Web App Configuration
 * Loaded securely via Vite environment variables (with Node test runner compatibility)
 */
const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

const firebaseConfig = {
  apiKey: sanitizeEnv(env.VITE_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(env.VITE_FIREBASE_APP_ID),
};

/**
 * Initialize Firebase App singleton
 * Uses getApps() to prevent duplicate initialization during HMR / re-renders
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication
 */
export const auth = getAuth(app);

/**
 * Initialize Cloud Firestore Database
 */
export const db = getFirestore(app);

export { app };
export default app;
