import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, auth, db } from '../firebase/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [authDiagnostic, setAuthDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Verify whether the authenticated user holds valid admin authorization.
   * Single Source of Truth: Cloud Firestore 'admins/{uid}' document.
   * 
   * Access is granted ONLY when:
   * 1. The document exists in collection 'admins' keyed by user.uid.
   * 2. role === "admin" (or "superadmin").
   * 3. active === true (boolean or 'true').
   */
  const verifyAdminAuthorization = async (user) => {
    if (!user || !user.uid) {
      setAdminProfile(null);
      setAuthDiagnostic(null);
      return false;
    }

    const projectId = app?.options?.projectId || db?.app?.options?.projectId || 'cab-service-9ed9e';
    const docPath = `admins/${user.uid}`;

    const diag = {
      uid: user.uid,
      email: user.email,
      projectId,
      docPath,
      docExists: null,
      role: null,
      active: null,
      errorCode: null,
      errorMessage: null,
      timestamp: new Date().toISOString(),
    };

    console.group(`[Admin Auth Check] Verifying '${user.email}' (${user.uid})`);
    console.log(`• Firebase Project ID   : ${projectId}`);
    console.log(`• Firestore Document Path: ${docPath}`);

    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        diag.docExists = false;
        diag.errorCode = 'not-found';
        diag.errorMessage = `Document '${docPath}' was not found in Firestore database '${projectId}'.`;
        console.warn(`❌ [Auth Result] Document does NOT exist at path '${docPath}'.`);
        console.groupEnd();
        setAuthDiagnostic(diag);
        setAdminProfile(null);
        return false;
      }

      diag.docExists = true;
      const adminData = adminDocSnap.data() || {};
      const rawRole = adminData.role;
      const rawActive = adminData.active;

      const normalizedRole = String(rawRole || '').toLowerCase().trim();
      const isActive = rawActive === true || rawActive === 'true';
      const isRoleValid = normalizedRole === 'admin' || normalizedRole === 'superadmin';

      diag.role = rawRole !== undefined ? String(rawRole) : '(missing)';
      diag.active = rawActive !== undefined ? String(rawActive) : '(missing)';

      console.log(`✓ Document exists! Raw data:`, adminData);
      console.log(`• Role evaluated   : '${rawRole}' -> valid: ${isRoleValid}`);
      console.log(`• Active evaluated : '${rawActive}' -> valid: ${isActive}`);

      if (!isRoleValid) {
        diag.errorCode = 'invalid-role';
        diag.errorMessage = `Document exists, but 'role' is '${rawRole}' (expected 'admin').`;
        console.warn(`❌ [Auth Result] Invalid role '${rawRole}' in '${docPath}'.`);
        console.groupEnd();
        setAuthDiagnostic(diag);
        setAdminProfile(adminData);
        return false;
      }

      if (!isActive) {
        diag.errorCode = 'inactive-account';
        diag.errorMessage = `Document exists, but 'active' is '${rawActive}' (expected true).`;
        console.warn(`❌ [Auth Result] Account is inactive (active=${rawActive}) in '${docPath}'.`);
        console.groupEnd();
        setAuthDiagnostic(diag);
        setAdminProfile(adminData);
        return false;
      }

      console.log(`✅ [Auth Result] Admin access GRANTED for UID '${user.uid}'.`);
      console.groupEnd();
      diag.errorCode = null;
      diag.errorMessage = null;
      setAuthDiagnostic(diag);
      setAdminProfile(adminData);
      return true;
    } catch (err) {
      diag.docExists = null;
      diag.errorCode = err.code || 'unknown-error';
      diag.errorMessage = err.message || String(err);

      console.error(`❌ [Auth Result] Firestore Exception during getDoc('${docPath}'):`);
      console.error(`• Error Code   : ${diag.errorCode}`);
      console.error(`• Error Message: ${diag.errorMessage}`);
      console.error(`• Full Error   :`, err);
      console.groupEnd();

      setAuthDiagnostic(diag);
      setAdminProfile(null);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const authorized = await verifyAdminAuthorization(user);
        setCurrentUser(user);
        setIsAdmin(authorized);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Firebase Email / Password Sign In
   */
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const authorized = await verifyAdminAuthorization(credential.user);
      setIsAdmin(authorized);
      return { success: true, user: credential.user, authorized };
    } catch (err) {
      let friendlyMessage = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid admin email or password. Please try again.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network connection error. Please verify your internet access.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage, code: err.code };
    }
  };

  /**
   * Firebase Sign Out
   */
  const logout = async () => {
    // Clear user and admin authorization immediately to prevent race conditions or redirects bouncing back
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminProfile(null);
    setAuthError(null);
    setAuthDiagnostic(null);

    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Error signing out of Firebase Auth:', err);
    } finally {
      setCurrentUser(null);
      setIsAdmin(false);
      setAdminProfile(null);
    }
  };

  /**
   * Re-read the Firestore 'admins/{uid}' document to verify updated admin permissions
   */
  const refreshAdminStatus = async () => {
    if (!auth.currentUser) {
      setIsAdmin(false);
      setAdminProfile(null);
      return false;
    }
    setLoading(true);
    try {
      const authorized = await verifyAdminAuthorization(auth.currentUser);
      setIsAdmin(authorized);
      return authorized;
    } catch (err) {
      console.error('Error refreshing admin status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    isAdmin,
    adminProfile,
    authDiagnostic,
    loading,
    authError,
    setAuthError,
    login,
    logout,
    refreshAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
