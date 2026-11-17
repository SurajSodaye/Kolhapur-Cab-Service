import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { Car, Home, Search, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found (404) — Kolhapur Cab Service"
        description="The requested page could not be found. Return to Kolhapur Cab Service homepage."
      />

      <main className="min-h-[70vh] bg-slate-50 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Car className="w-10 h-10" />
          </div>

          <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 block">
            404
          </span>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mt-2">
            Route Off the Highway!
          </h1>

          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            The page you are looking for does not exist or may have been relocated. Let’s get you back on the right route.
          </p>

          <div className="mt-8 space-y-2.5">
            <Link
              to="/"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 shadow-subtle"
            >
              <Home className="w-4 h-4" />
              <span>Back to Homepage</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/booking-status"
                className="py-2.5 px-3 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span>Track Booking</span>
              </Link>

              <Link
                to="/routes"
                className="py-2.5 px-3 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Popular Routes</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
