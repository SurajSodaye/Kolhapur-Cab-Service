import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Phone, 
  User, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  AlertCircle, 
  ChevronRight, 
  X, 
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';
import { getCustomerBookings } from '../services/bookingService.js';
import SEO from '../components/common/SEO.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusTimeline from '../components/common/StatusTimeline.jsx';

export default function MyBookings() {
  const { currentCustomer } = useCustomerAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'previous'
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    if (!currentCustomer?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerBookings(currentCustomer.uid);
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
      setError('Could not retrieve your bookings at this time. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentCustomer?.uid]);

  // Filter bookings:
  // Upcoming / Active: PENDING, CONFIRMED, DRIVER_ASSIGNED, EN_ROUTE
  // Previous: COMPLETED, CANCELLED
  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );
  const previousBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  const currentList = activeTab === 'upcoming' ? upcomingBookings : previousBookings;

  return (
    <>
      <SEO
        title="My Bookings — Kolhapur Cab Service"
        description="View your past and upcoming Kolhapur cab reservations, assigned chauffeurs, live dispatch status, and trip receipts."
      />

      <main className="min-h-[85vh] bg-slate-50 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Customer Workspace
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                My Cab Bookings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time overview of all trips associated with your customer account.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchBookings}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-subtle disabled:opacity-50"
                title="Refresh bookings"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-sm"
              >
                <Car className="w-4 h-4" />
                <span>Book a New Cab</span>
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'bg-amber-50 text-amber-900 shadow-sm border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Upcoming & Active Trips</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab === 'upcoming' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {upcomingBookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('previous')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'previous'
                  ? 'bg-amber-50 text-amber-900 shadow-sm border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Past & Completed</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab === 'previous' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {previousBookings.length}
              </span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong>Failed to load bookings:</strong> {error}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={fetchBookings}
                    className="font-bold underline text-rose-900 hover:text-rose-950"
                  >
                    Retry Loading
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-5 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                  <div className="h-10 bg-slate-200 rounded-xl w-28" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && currentList.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-10 sm:p-16 text-center max-w-xl mx-auto my-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {activeTab === 'upcoming' ? 'No Active Cab Bookings' : 'No Previous Bookings Found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
                {activeTab === 'upcoming'
                  ? 'You do not have any pending or confirmed trips scheduled right now. Plan your next journey across Maharashtra, Goa, or Karnataka with us.'
                  : 'You have not completed any rides under this customer account yet.'}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/booking"
                  className="py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition"
                >
                  Book Your Next Cab
                </Link>
                <Link
                  to="/routes"
                  className="py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Explore Popular Routes
                </Link>
              </div>
            </div>
          )}

          {/* Bookings List */}
          {!loading && !error && currentList.length > 0 && (
            <div className="space-y-4">
              {currentList.map((item) => {
                const formattedDate = item.pickupDate
                  ? new Date(item.pickupDate + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : item.pickupDate || '—';

                const bookedOn = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all p-5 sm:p-6"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                          {item.id}
                        </span>
                        <Badge status={item.status} size="sm" />
                        <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                        <span className="text-xs text-slate-500 capitalize">
                          {item.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                        </span>
                        {bookedOn && (
                          <span className="text-[11px] text-slate-400">
                            (Booked on {bookedOn})
                          </span>
                        )}
                      </div>

                      <div className="text-left lg:text-right">
                        <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                          Estimated Total
                        </span>
                        <span className="text-lg font-black font-mono text-slate-900">
                          ₹{Number(item.estimatedFare || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Pickup Location
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">
                              {item.pickupLocation}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Destination
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">
                              {item.dropLocation}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 text-xs border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Pickup: <strong>{item.pickupTime || '—'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{item.vehicleName || 'Sedan'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Driver details preview if assigned */}
                    {item.driverDetails && (
                      <div className="mb-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                            {item.driverDetails.name ? item.driverDetails.name.slice(0, 2).toUpperCase() : 'DR'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {item.driverDetails.name} • {item.driverDetails.vehicleModel || 'Cab'}
                            </span>
                            <span className="text-[11px] text-slate-600 font-mono">
                              Reg: {item.driverDetails.vehicleReg || 'Pending'}
                            </span>
                          </div>
                        </div>

                        {item.driverDetails.phone && (
                          <a
                            href={`tel:${item.driverDetails.phone.replace(/\s+/g, '')}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] text-slate-900 bg-white hover:bg-slate-100 border border-amber-300 shadow-2xs transition"
                          >
                            <Phone className="w-3 h-3 text-amber-600" />
                            <span>Call Driver ({item.driverDetails.phone})</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="text-slate-500 text-[11px]">
                        {item.statusNotes && (
                          <span className="italic line-clamp-1 max-w-md">
                            Note: {item.statusNotes}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Link
                          to={`/booking-status/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Live Tracking</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelectedBooking(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-2xs transition"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                  Trip Details
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {selectedBooking.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Timeline */}
            <div className="my-5">
              <StatusTimeline currentStatus={selectedBooking.status} />
            </div>

            {/* Trip Specs Grid */}
            <div className="bg-slate-50 rounded-2xl p-4 my-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Vehicle</span>
                  <strong className="text-slate-800 text-sm block">{selectedBooking.vehicleName}</strong>
                  <span className="text-slate-500 text-[11px]">{selectedBooking.vehicleCategory}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Trip Type</span>
                  <strong className="text-slate-800 text-sm capitalize block">
                    {selectedBooking.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                  </strong>
                  <span className="text-slate-500 text-[11px]">
                    {selectedBooking.passengers} Passengers • {selectedBooking.luggage} Bags
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Pickup Date & Time</span>
                  <strong className="text-slate-800 block">
                    {selectedBooking.pickupDate} at {selectedBooking.pickupTime}
                  </strong>
                </div>
                {selectedBooking.returnDate && (
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Return Date</span>
                    <strong className="text-slate-800 block">{selectedBooking.returnDate}</strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Fare</span>
                  <strong className="text-slate-900 font-mono text-base block">
                    ₹{Number(selectedBooking.estimatedFare || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-3 my-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">From</span>
                <span className="font-semibold text-slate-800 text-sm">{selectedBooking.pickupLocation}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">To</span>
                <span className="font-semibold text-slate-800 text-sm">{selectedBooking.dropLocation}</span>
              </div>
            </div>

            {/* Dispatch Notes */}
            {selectedBooking.statusNotes && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 my-4">
                <span className="font-bold block mb-0.5">Kolhapur Dispatch Desk Message:</span>
                <p className="leading-relaxed">{selectedBooking.statusNotes}</p>
              </div>
            )}

            {/* Chauffeur Assignment if available */}
            {selectedBooking.driverDetails && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white my-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                    Assigned Chauffeur
                  </span>
                  <span className="text-emerald-400 font-bold">★ {selectedBooking.driverDetails.rating || '4.9'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-sm block">{selectedBooking.driverDetails.name}</strong>
                    <span className="text-slate-400 font-mono">{selectedBooking.driverDetails.vehicleReg}</span>
                  </div>
                  {selectedBooking.driverDetails.phone && (
                    <a
                      href={`tel:${selectedBooking.driverDetails.phone.replace(/\s+/g, '')}`}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      Call Driver
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/booking-status/${selectedBooking.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-600 transition"
              >
                <Search className="w-3.5 h-3.5 text-amber-500" />
                <span>Open Public Tracking Page</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-slate-950 bg-slate-100 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
