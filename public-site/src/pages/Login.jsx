import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import SEO from '../components/common/SEO.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentCustomer, loading: authLoading } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination and preserved booking draft after login
  const destinationPath = typeof location.state?.from === 'string'
    ? location.state.from
    : (location.state?.from?.pathname || '/my-bookings');
  const bookingDraft = location.state?.bookingDraft || null;
  const notice = location.state?.notice || '';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && currentCustomer) {
      if (bookingDraft) {
        navigate(destinationPath, {
          replace: true,
          state: {
            ...bookingDraft,
            notice: 'Signed in! Complete your cab booking below.',
          },
        });
      } else {
        navigate(destinationPath, { replace: true });
      }
    }
  }, [currentCustomer, authLoading, navigate, destinationPath, bookingDraft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your registered email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      if (bookingDraft) {
        navigate(destinationPath, {
          replace: true,
          state: {
            ...bookingDraft,
            notice: 'Signed in successfully! Your cab booking details have been restored.',
          },
        });
      } else {
        navigate(destinationPath, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to sign in. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Customer Sign In — Kolhapur Cab Service"
        description="Sign in to your Kolhapur Cab Service account to view active bookings, download ride receipts, and manage your travel profile."
      />

      <main className="min-h-[80vh] bg-slate-50 py-12 sm:py-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-card p-7 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <LogIn className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Sign In to Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Access your Kolhapur cab bookings, live driver updates, and invoices.
            </p>
          </div>

          {/* Notice banner (e.g. login required or registration success) */}
          {notice && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-3 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-3 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Don't have a customer account?{' '}
              <Link
                to="/register"
                state={location.state}
                className="font-bold text-amber-600 hover:text-amber-700 underline decoration-amber-400/40"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Quick trust reassurance */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure 256-bit encrypted authentication</span>
          </div>
        </div>
      </main>
    </>
  );
}
