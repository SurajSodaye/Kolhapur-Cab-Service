import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase.js';

const CustomerAuthContext = createContext(null);

/**
 * Format Firebase Auth errors into clean, user-friendly messages
 */
function formatAuthError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = err.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Please contact customer support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact Kolhapur Cab Service support.';
    case 'auth/too-many-requests':
      return 'Too many failed sign-in attempts. Please wait a few moments or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/requires-recent-login':
      return 'This action requires recent authentication. Please sign in again.';
    default:
      return err.message || 'Authentication failed. Please try again.';
  }
}

export function CustomerAuthProvider({ children }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Fetch customer profile document from Cloud Firestore: 'customers/{uid}'
   */
  const fetchCustomerProfile = async (user) => {
    if (!user || !user.uid) {
      setCustomerProfile(null);
      return null;
    }

    try {
      const docRef = doc(db, 'customers', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCustomerProfile(data);
        return data;
      }

      // If document doesn't exist yet (e.g. created directly via Auth or legacy),
      // initialize the customer profile document
      const fallbackProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Customer',
        email: user.email?.toLowerCase() || '',
        phone: user.phoneNumber || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(docRef, fallbackProfile, { merge: true });
        setCustomerProfile(fallbackProfile);
        return fallbackProfile;
      } catch (writeErr) {
        console.warn('Could not auto-create customer profile document:', writeErr);
        setCustomerProfile(fallbackProfile);
        return fallbackProfile;
      }
    } catch (err) {
      console.warn('Error reading customer profile document:', err);
      // Fallback in-memory profile so UI can still display customer name
      const fallback = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        phone: user.phoneNumber || '',
      };
      setCustomerProfile(fallback);
      return fallback;
    }
  };

  /**
   * Observe Firebase Auth state
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentCustomer(user);
        await fetchCustomerProfile(user);
      } else {
        setCurrentCustomer(null);
        setCustomerProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Customer Registration
   * 1. Creates Firebase Auth user
   * 2. Sets user display name
   * 3. Creates 'customers/{uid}' Firestore profile document
   */
  const register = async ({ email, password, name, phone }) => {
    setAuthError(null);
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').trim();

    if (!cleanEmail) throw new Error('Email address is required.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
    if (!cleanName) throw new Error('Full name is required.');
    if (!cleanPhone) throw new Error('Contact phone number is required.');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Update Firebase Auth user display name
      if (cleanName) {
        try {
          await updateProfile(user, { displayName: cleanName });
        } catch (profileErr) {
          console.warn('Could not set displayName on Auth user:', profileErr);
        }
      }

      // Write customer profile in Firestore: 'customers/{uid}'
      const now = new Date().toISOString();
      const profileData = {
        uid: user.uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await setDoc(doc(db, 'customers', user.uid), profileData);
      } catch (firestoreErr) {
        console.warn('Notice: Customer profile doc write failed:', firestoreErr);
      }

      setCurrentCustomer(user);
      setCustomerProfile(profileData);
      return { success: true, user, profile: profileData };
    } catch (err) {
      const friendlyMessage = formatAuthError(err);
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Customer Sign In
   */
  const login = async (email, password) => {
    setAuthError(null);
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanEmail) throw new Error('Email address is required.');
    if (!password) throw new Error('Password is required.');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      setCurrentCustomer(user);
      const profile = await fetchCustomerProfile(user);
      return { success: true, user, profile };
    } catch (err) {
      const friendlyMessage = formatAuthError(err);
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Customer Sign Out
   */
  const logout = async () => {
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Error during customer sign-out:', err);
    } finally {
      setCurrentCustomer(null);
      setCustomerProfile(null);
    }
  };

  /**
   * Password Reset Request
   */
  const resetPassword = async (email) => {
    setAuthError(null);
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) throw new Error('Please enter your registered email address.');

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (err) {
      const friendlyMessage = formatAuthError(err);
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Update Customer Profile Document
   */
  const updateCustomerProfile = async ({ name, phone }) => {
    if (!currentCustomer) throw new Error('No authenticated customer found.');
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || '').trim();

    if (!cleanName) throw new Error('Full name cannot be blank.');
    if (!cleanPhone) throw new Error('Phone number cannot be blank.');

    const now = new Date().toISOString();
    const updatePayload = {
      name: cleanName,
      phone: cleanPhone,
      updatedAt: now,
    };

    // Update Firebase Auth user display name
    try {
      await updateProfile(currentCustomer, { displayName: cleanName });
    } catch (e) {
      console.warn('Could not update Auth user displayName:', e);
    }

    // Update Firestore customer doc
    const docRef = doc(db, 'customers', currentCustomer.uid);
    await setDoc(docRef, updatePayload, { merge: true });

    setCustomerProfile((prev) => ({
      ...prev,
      ...updatePayload,
    }));

    return { success: true };
  };

  const value = {
    currentCustomer,
    customerProfile,
    isCustomerAuthenticated: !!currentCustomer,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    resetPassword,
    updateCustomerProfile,
    refreshProfile: () => fetchCustomerProfile(currentCustomer),
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}

export default CustomerAuthContext;
