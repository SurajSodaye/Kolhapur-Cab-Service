import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import SEO from '../components/common/SEO.jsx';

export default function ForgotPassword() {
  const { resetPassword } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset link. Please verify the email entered.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Reset Password — Kolhapur Cab Service"
        description="Reset your Kolhapur Cab Service customer account password securely."
      />

      <main className="min-h-[75vh] bg-slate-50 py-12 sm:py-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-card p-7 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <KeyRound className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
              Account Recovery
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Enter your registered email and we'll send you a password reset link.
            </p>
          </div>

          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Password Reset Email Sent!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We've dispatched a recovery link to <strong>{email}</strong>. Please check your inbox (and spam folder) and follow the instructions to set a new password.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Registered Email</span>
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{submitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
