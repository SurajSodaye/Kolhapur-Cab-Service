import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { currentUser, isAdmin, loading, logout, refreshAdminStatus, authDiagnostic } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshNotice(null);
    try {
      const authorized = await refreshAdminStatus();
      if (!authorized) {
        setRefreshNotice('Admin check completed. See diagnostic details below for exact status.');
      }
    } catch (err) {
      setRefreshNotice('Failed to check admin status. Please verify your connection to Cloud Firestore.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 1. Loading State (waiting for Firebase Auth to initialize token)
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a192f',
          color: '#ffffff',
          fontFamily: 'Inter, system-ui, sans-serif',
          gap: '16px',
        }}
      >
        <div style={{ position: 'relative', width: '56px', height: '56px' }}>
          <img
            src="/brand-emblem-128.png"
            alt="Kolhapur Cab Service Emblem"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '14px', fontWeight: 600 }}>
          <Loader2 size={18} className="spin-icon" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect to Login
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Authenticated but lacks Admin Authorization
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '20px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '32px 28px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Access Restricted
          </h2>

          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: '0 0 16px' }}>
            You are signed in as <strong>{currentUser.email}</strong>, but this account does not have administrator privileges for the Kolhapur Cab Service operations portal.
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#475569',
              textAlign: 'left',
              marginBottom: '24px',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <strong>Your Firebase Auth UID:</strong>
              <div
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#0f172a',
                  wordBreak: 'break-all',
                  marginTop: '4px',
                  userSelect: 'all',
                }}
              >
                {currentUser.uid}
              </div>
            </div>
            <strong>Required Firestore Document:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: '18px', lineHeight: 1.5 }}>
              <li>Collection: <code>admins</code></li>
              <li>Document ID: <code>{currentUser.uid}</code></li>
              <li>Field: <code>role: "admin"</code> (string)</li>
              <li>Field: <code>active: true</code> (boolean)</li>
            </ul>
          </div>

          {authDiagnostic && (
            <div
              style={{
                background: authDiagnostic.errorCode ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${authDiagnostic.errorCode ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                color: '#334155',
                textAlign: 'left',
                marginBottom: '16px',
                fontFamily: 'monospace',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                🔍 Live Firestore Diagnostic:
              </div>
              <div>• Project ID: <strong>{authDiagnostic.projectId}</strong></div>
              <div>• Path: <strong>{authDiagnostic.docPath}</strong></div>
              <div>
                • Document Exists:{' '}
                {authDiagnostic.docExists === null ? (
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>UNKNOWN (read failed)</span>
                ) : authDiagnostic.docExists ? (
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>YES</span>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>NO</span>
                )}
              </div>
              {authDiagnostic.docExists && (
                <>
                  <div>• Role in Firestore: <strong>{authDiagnostic.role}</strong></div>
                  <div>• Active in Firestore: <strong>{authDiagnostic.active}</strong></div>
                </>
              )}
              {authDiagnostic.errorCode && (
                <div style={{ marginTop: '8px', padding: '6px 8px', background: '#fee2e2', borderRadius: '4px', color: '#b91c1c' }}>
                  <strong>Error Code:</strong> <code>{authDiagnostic.errorCode}</code>
                  <div style={{ wordBreak: 'break-word', marginTop: '2px', fontSize: '11px' }}>{authDiagnostic.errorMessage}</div>
                </div>
              )}
            </div>
          )}

          {refreshNotice && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#92400e',
                marginBottom: '16px',
                textAlign: 'left',
              }}
            >
              {refreshNotice}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                height: '42px',
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                opacity: isRefreshing ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
              }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'spin-icon' : ''} />
              <span>{isRefreshing ? 'Checking Firestore...' : 'Re-check Admin Permissions'}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                height: '42px',
                background: '#0a192f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out & Return to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated & Authorized -> Render Protected Routes
  return <Outlet />;
}
