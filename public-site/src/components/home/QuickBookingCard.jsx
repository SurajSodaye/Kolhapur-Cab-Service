import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Plane,
  ShieldCheck,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import { mockSettings } from '../../data/mockContent';
import { mockVehicles } from '../../data/mockVehicles';

export default function QuickBookingCard({ className = '' }) {
  const navigate = useNavigate();

  // Today and tomorrow dates in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [tripType, setTripType] = useState('one-way');
  const [pickupLocation, setPickupLocation] = useState('Central Bus Stand (CBS) Kolhapur');
  const [dropLocation, setDropLocation] = useState('Pune');
  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [pickupTime, setPickupTime] = useState('07:00');
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 172800000).toISOString().split('T')[0]);
  const [vehicleId, setVehicleId] = useState('veh-sedan-dzire');
  const [passengers, setPassengers] = useState(4);
  const [error, setError] = useState('');

  const handleSwapLocations = () => {
    const temp = pickupLocation;
    setPickupLocation(dropLocation);
    setDropLocation(temp);
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!pickupLocation.trim()) {
      setError('Please select or enter a pickup location in Kolhapur.');
      return;
    }

    if (!dropLocation.trim()) {
      setError('Please select or enter your drop destination.');
      return;
    }

    if (pickupLocation.trim().toLowerCase() === dropLocation.trim().toLowerCase()) {
      setError('Pickup and drop locations cannot be identical.');
      return;
    }

    if (tripType === 'round-trip' && returnDate < pickupDate) {
      setError('Return date cannot be earlier than pickup date.');
      return;
    }

    // Navigate to full booking page with parameters in route state
    navigate('/booking', {
      state: {
        tripType,
        pickupLocation,
        dropLocation,
        pickupDate,
        pickupTime,
        returnDate: tripType === 'round-trip' ? returnDate : null,
        vehicleId,
        passengers: Number(passengers)
      }
    });
  };

  // Concise vehicle option labels to prevent ugly dropdown clipping
  const getVehicleOptionLabel = (v) => {
    let shortName = v.name.replace(' / Honda Amaze', '');
    return `${shortName} (${v.category}) • ₹${v.pricing.ratePerKm}/km`;
  };

  return (
    <div className={`bg-white rounded-3xl shadow-floating border border-slate-200/90 p-5 sm:p-7 relative z-20 ${className}`}>
      {/* Integrated Card Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-950 font-heading flex items-center gap-2">
            <span>Instant Cab Booking</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Get transparent fare estimates & reserve in 60 seconds</p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-500/25 text-xs font-bold shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Instant Estimate</span>
        </div>
      </div>

      {/* Trip Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl mb-5">
        {[
          { id: 'one-way', label: 'One-Way', icon: Navigation },
          { id: 'round-trip', label: 'Round Trip', icon: RotateCcw },
          { id: 'local', label: 'Local Hourly', icon: Clock },
          { id: 'airport', label: 'Airport Drop', icon: Plane },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = tripType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setTripType(tab.id);
                if (tab.id === 'local') {
                  setDropLocation('Kolhapur Sightseeing (Mahalaxmi / Jyotiba / Panhala)');
                } else if (tab.id === 'airport') {
                  setDropLocation('Pune Airport (PNQ)');
                }
              }}
              className={`py-2 px-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleQuickSubmit} className="space-y-4">
        {/* Pickup & Drop Row with Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Pickup Location</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                list="pickup-options"
                placeholder="e.g. Central Bus Stand (CBS)"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition font-medium text-slate-900 shadow-sm"
                required
              />
              <datalist id="pickup-options">
                {mockSettings.popularPickupLocations.map((loc, idx) => (
                  <option key={idx} value={loc} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Drop Destination</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                list="drop-options"
                placeholder="e.g. Pune, Goa, Mumbai Airport"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none transition font-medium text-slate-900 shadow-sm"
                required
              />
              <datalist id="drop-options">
                {mockSettings.popularDropLocations.map((loc, idx) => (
                  <option key={idx} value={loc} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Date, Time & Passenger Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Pickup Date</span>
            </label>
            <input
              type="date"
              min={today}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none font-medium text-slate-900 shadow-sm transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Pickup Time</span>
            </label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none font-medium text-slate-900 shadow-sm transition"
              required
            />
          </div>

          {tripType === 'round-trip' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Return Date</span>
              </label>
              <input
                type="date"
                min={pickupDate || today}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none font-medium text-slate-900 shadow-sm transition"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Passengers</span>
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none font-medium text-slate-900 shadow-sm transition"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests (Sedan)</option>
                <option value={6}>6 Guests (SUV Ertiga)</option>
                <option value={7}>7 Guests (Innova Crysta)</option>
                <option value={17}>17 Guests (Traveller)</option>
              </select>
            </div>
          )}
        </div>

        {/* Preferred Vehicle & Submit Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1 items-end">
          <div className="md:col-span-7">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Select Preferred Vehicle</span>
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none font-medium text-slate-900 shadow-sm transition"
            >
              {mockVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {getVehicleOptionLabel(v)}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-500 shadow-md shadow-amber-500/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Check Fare & Book</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </form>

      {/* Trust Guarantee Strip */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Zero Advance Fee</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-slate-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Chilled Dual AC</span>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-1.5 text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>FASTag Toll Direct</span>
        </div>
      </div>
    </div>
  );
}
