import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Calendar, ShieldCheck, Check, AlertCircle, LogOut, Car, ArrowRight } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import SEO from '../components/common/SEO.jsx';

export default function Profile() {
  const { currentCustomer, customerProfile, updateCustomerProfile, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (customerProfile) {
      setName(customerProfile.name || currentCustomer?.displayName || '');
      setPhone(customerProfile.phone || currentCustomer?.phoneNumber || '');
    } else if (currentCustomer) {
      setName(currentCustomer.displayName || '');
      setPhone(currentCustomer.phoneNumber || '');
    }
  }, [customerProfile, currentCustomer]);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name cannot be blank.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Phone number cannot be blank.');
      return;
    }

    setSaving(true);
    try {
      await updateCustomerProfile({ name, phone });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const memberSince = customerProfile?.createdAt
    ? new Date(customerProfile.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <>
      <SEO
        title="My Profile — Kolhapur Cab Service"
        description="Manage your Kolhapur Cab Service profile, contact details, and account preferences."
      />

      <main className="min-h-[80vh] bg-slate-50 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Account Settings
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                Customer Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your personal details used for cab dispatches and ride invoices.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/my-bookings"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 transition shadow-sm"
              >
                <Car className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar Summary Card */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
                  {name ? name.slice(0, 2).toUpperCase() : 'CU'}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {name || 'Customer'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 break-all">
                  {currentCustomer?.email}
                </p>

                <div className="mt-5 pt-5 border-t border-slate-100 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Member Since</span>
                    <strong className="text-slate-800">{memberSince}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Account Security</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Booking CTA card */}
              <div className="bg-navy-950 text-white rounded-3xl p-6 shadow-card border border-slate-800">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Ready to Travel?
                </span>
                <h4 className="text-sm font-bold mb-2">Book a Cab Instantly</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Outstation trips to Pune, Mumbai, Goa, and Konkan with verified local chauffeurs.
                </p>
                <Link
                  to="/booking"
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Book New Cab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Profile Edit Form Card */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8">
                <h3 className="text-base font-bold text-slate-900 font-heading mb-5 pb-3 border-b border-slate-100">
                  Personal Information
                </h3>

                {successMessage && (
                  <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Jadhav"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address (Account Identifier)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentCustomer?.email || ''}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono text-xs"
                    />
                    <small className="text-[11px] text-slate-400 mt-1 block">
                      Email address is linked to your Firebase Authentication credentials.
                    </small>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Primary Contact Phone</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-900 transition"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={saving}
                      className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
