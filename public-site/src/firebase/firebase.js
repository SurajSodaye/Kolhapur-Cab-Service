import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Helper to ensure environment variable values are clean and unquoted
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
  apiKey: sanitizeEnv(env.VITE_FIREBASE_API_KEY) || 'AIzaSyDemoTestKey_KolhapurCabService_Mock_9822',
  authDomain: sanitizeEnv(env.VITE_FIREBASE_AUTH_DOMAIN) || 'cab-service-9ed9e.firebaseapp.com',
  projectId: sanitizeEnv(env.VITE_FIREBASE_PROJECT_ID) || 'cab-service-9ed9e',
  storageBucket: sanitizeEnv(env.VITE_FIREBASE_STORAGE_BUCKET) || 'cab-service-9ed9e.firebasestorage.app',
  messagingSenderId: sanitizeEnv(env.VITE_FIREBASE_MESSAGING_SENDER_ID) || '455501683564',
  appId: sanitizeEnv(env.VITE_FIREBASE_APP_ID) || '1:455501683564:web:e9d7b2cd50f641dcc5b149',
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
