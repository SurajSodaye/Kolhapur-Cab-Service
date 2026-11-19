import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import SEO from '../components/common/SEO.jsx';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, currentCustomer, loading: authLoading } = useCustomerAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination and preserved booking draft after registration
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
            notice: 'Account ready! Complete your cab booking below.',
          },
        });
      } else {
        navigate(destinationPath, { replace: true });
      }
    }
  }, [currentCustomer, authLoading, navigate, destinationPath, bookingDraft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { name, phone, email, password, confirmPassword } = formData;

    // Client-side validations
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s()-]/g, '').replace(/^(?:\+91|91|0)/, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g., 98220 12345).');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        email: email.trim(),
        password,
      });

      if (bookingDraft) {
        navigate(destinationPath, {
          replace: true,
          state: {
            ...bookingDraft,
            notice: 'Account created successfully! Your cab booking details have been restored.',
          },
        });
      } else {
        navigate(destinationPath, {
          replace: true,
          state: { notice: 'Account created successfully! Welcome to Kolhapur Cab Service.' },
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Create Customer Account — Kolhapur Cab Service"
        description="Register a free account with Kolhapur Cab Service to easily manage bookings, view driver assignments, and access ride history."
      />

      <main className="min-h-[85vh] bg-slate-50 py-12 sm:py-20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-card p-7 sm:p-10">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UserPlus className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
              New Customer Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Book faster, track past trips, and receive timely driver dispatches.
            </p>
          </div>

          {/* Notice Banner */}
          {notice && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{notice}</div>
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Jadhav"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Mobile Number *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98220 12345"
                  className="w-full pl-12 pr-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password *</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Confirm *</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-type"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-500 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{submitting ? 'Creating Account...' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Already have account */}
          <div className="mt-7 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                state={location.state}
                className="font-bold text-amber-600 hover:text-amber-700 underline decoration-amber-400/40"
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Customer data is protected & never shared</span>
          </div>
        </div>
      </main>
    </>
  );
}
