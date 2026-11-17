import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Users, 
  Briefcase, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  Copy, 
  Check, 
  Printer, 
  Search,
  Sparkles
} from 'lucide-react';
import { mockVehicles } from '../../data/mockVehicles';
import { mockSettings } from '../../data/mockContent';
import { createBooking } from '../../services/bookingService';
import Badge from '../common/Badge';
import StatusTimeline from '../common/StatusTimeline';

export default function BookingForm({ initialState = {} }) {
  const navigate = useNavigate();

  // Date helpers
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Form State
  const [tripType, setTripType] = useState(initialState.tripType || 'one-way');
  const [pickupLocation, setPickupLocation] = useState(initialState.pickupLocation || '');
  const [dropLocation, setDropLocation] = useState(initialState.dropLocation || '');
  const [pickupDate, setPickupDate] = useState(initialState.pickupDate || tomorrow);
  const [pickupTime, setPickupTime] = useState(initialState.pickupTime || '08:00');
  const [returnDate, setReturnDate] = useState(initialState.returnDate || new Date(Date.now() + 172800000).toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(initialState.passengers || 4);
  const [luggage, setLuggage] = useState(initialState.luggage || 2);
  const [vehicleId, setVehicleId] = useState(initialState.vehicleId || 'veh-sedan-dzire');
  
  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [copied, setCopied] = useState(false);

  // Selected vehicle lookup
  const selectedVehicle = mockVehicles.find(v => v.id === vehicleId) || mockVehicles[0];

  // Distance estimation based on popular pairs
  const calculateEstimatedDistance = () => {
    const p = pickupLocation.toLowerCase();
    const d = dropLocation.toLowerCase();

    if (d.includes('pune')) return 235;
    if (d.includes('mumbai')) return 385;
    if (d.includes('goa')) return 215;
    if (d.includes('belgaum') || d.includes('belagavi')) return 110;
    if (d.includes('mahabaleshwar')) return 180;
    if (d.includes('ganpatipule') || d.includes('ratnagiri')) return 145;
    if (d.includes('shirdi')) return 440;
    if (d.includes('bangalore')) return 620;
    if (tripType === 'local') return 80;
    return 150; // default estimated outstation distance
  };

  const estimatedDistance = calculateEstimatedDistance();
  const effectiveDistance = tripType === 'round-trip' ? estimatedDistance * 2 : estimatedDistance;
  const estimatedFare = Math.max(
    tripType === 'local' ? 2200 : 1500,
    effectiveDistance * (selectedVehicle.pricing.ratePerKm || 12) + 
    (tripType === 'round-trip' ? selectedVehicle.pricing.driverAllowancePerDay || 400 : 0)
  );

  // Validation
  const validateForm = () => {
    const errs = {};

    // Required Locations
    if (!pickupLocation.trim()) {
      errs.pickupLocation = 'Pickup location in Kolhapur is required.';
    }
    if (!dropLocation.trim()) {
      errs.dropLocation = 'Drop destination is required.';
    }
    if (
      pickupLocation.trim() && 
      dropLocation.trim() && 
      pickupLocation.trim().toLowerCase() === dropLocation.trim().toLowerCase()
    ) {
      errs.dropLocation = 'Pickup and drop locations cannot be identical.';
    }

    // Date Validation
    if (!pickupDate) {
      errs.pickupDate = 'Pickup date is required.';
    } else if (pickupDate < today) {
      errs.pickupDate = 'Pickup date cannot be in the past.';
    }

    if (!pickupTime) {
      errs.pickupTime = 'Pickup time is required.';
    }

    if (tripType === 'round-trip') {
      if (!returnDate) {
        errs.returnDate = 'Return date is required for round trips.';
      } else if (returnDate < pickupDate) {
        errs.returnDate = 'Return date cannot be earlier than pickup date.';
      }
    }

    // Customer Name
    if (!customerName.trim()) {
      errs.customerName = 'Please enter your full name.';
    } else if (customerName.trim().length < 3) {
      errs.customerName = 'Name must be at least 3 characters.';
    }

    // Indian Mobile Number Validation (10 digits starting with 6-9, optional +91 or 0 prefix)
    const cleanedPhone = customerPhone.replace(/[\s-]/g, '');
    const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!customerPhone.trim()) {
      errs.customerPhone = 'Mobile number is required.';
    } else if (!indianPhoneRegex.test(cleanedPhone)) {
      errs.customerPhone = 'Enter a valid 10-digit Indian mobile number (e.g. 98220 12345).';
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      errs.customerEmail = 'Email address is required for sending booking status.';
    } else if (!emailRegex.test(customerEmail.trim())) {
      errs.customerEmail = 'Enter a valid email address (e.g. name@example.com).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createBooking({
        tripType,
        pickupLocation,
        dropLocation,
        pickupDate,
        pickupTime,
        returnDate: tripType === 'round-trip' ? returnDate : null,
        passengers: Number(passengers),
        luggage: Number(luggage),
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        vehicleCategory: selectedVehicle.category,
        customerName,
        customerPhone,
        customerEmail,
        additionalNotes,
        estimatedDistanceKm: effectiveDistance,
        estimatedFare: estimatedFare,
        baseFare: estimatedFare
      });

      if (response.success) {
        setSubmittedBooking(response.booking);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Booking submission error', err);
      setErrors({ form: 'An unexpected error occurred while placing your request. Please call our 24x7 desk.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBookingId = () => {
    if (submittedBooking?.id) {
      navigator.clipboard.writeText(submittedBooking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SUCCESSFUL BOOKING REQUEST SCREEN
  if (submittedBooking) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-premium p-6 sm:p-10 animate-in fade-in-50 duration-300">
        {/* Important Pending Status Banner */}
        <div className="text-center pb-8 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 border-2 border-amber-300">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="inline-block mb-3">
            <Badge variant="PENDING" size="lg">
              Status: PENDING ADMIN CONFIRMATION
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Booking Request Received!
          </h2>

          <div className="mt-4 p-4.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-left max-w-xl mx-auto flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
              <span className="font-bold block text-amber-950 mb-0.5">Please Note (Important):</span>
              Your cab request is currently in <span className="font-bold underline">PENDING</span> status. It is undergoing schedule review by our Kolhapur dispatch desk. A representative will contact you within <strong>15–30 minutes</strong> to confirm vehicle assignment, pickup coordinates, and final fare. <strong>This booking request does not guarantee immediate cab dispatch and does not constitute a confirmed ride until approved by our Kolhapur dispatch team.</strong>
            </div>
          </div>
        </div>

        {/* Reference Number Card */}
        <div className="my-6 p-5 sm:p-6 bg-navy-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
              Booking Reference Number
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
              {submittedBooking.id}
            </span>
            {submittedBooking.trackingToken && (
              <span className="text-[11px] text-slate-400 block mt-1">
                Secure Tracking Token: <span className="font-mono text-amber-300/90">{submittedBooking.trackingToken.slice(0, 16)}...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyBookingId}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Reference Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Reference</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/booking-status/${submittedBooking.trackingToken || submittedBooking.id}`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="py-4 border-b border-slate-100">
          <StatusTimeline currentStatus={submittedBooking.status} />
        </div>

        {/* Booking Summary Details */}
        <div className="py-6 space-y-4 text-sm text-slate-700">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Trip Request Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Trip Type</span>
              <span className="font-bold capitalize text-slate-900">{submittedBooking.tripType}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Requested Vehicle</span>
              <span className="font-bold text-slate-900">{submittedBooking.vehicleName} ({submittedBooking.vehicleCategory})</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Pickup Location</span>
              <span className="font-bold text-slate-900">{submittedBooking.pickupLocation}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Drop Destination</span>
              <span className="font-bold text-slate-900">{submittedBooking.dropLocation}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Pickup Date & Time</span>
              <span className="font-bold text-slate-900">{submittedBooking.pickupDate} at {submittedBooking.pickupTime}</span>
            </div>
            {submittedBooking.returnDate && (
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Return Date</span>
                <span className="font-bold text-slate-900">{submittedBooking.returnDate}</span>
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Passengers / Luggage</span>
              <span className="font-bold text-slate-900">{submittedBooking.passengers} Passengers, {submittedBooking.luggage} Bags</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Estimated Quote</span>
              <span className="font-bold text-emerald-700 text-base">₹{submittedBooking.estimatedFare} (Approx)</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Passenger Contact</span>
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-800">
              <span><strong>Name:</strong> {submittedBooking.customerName}</span>
              <span>•</span>
              <span><strong>Phone:</strong> {submittedBooking.customerPhone}</span>
              <span>•</span>
              <span><strong>Email:</strong> {submittedBooking.customerEmail}</span>
            </div>
            {submittedBooking.additionalNotes && (
              <p className="mt-2 text-xs text-slate-600">
                <strong>Instructions:</strong> {submittedBooking.additionalNotes}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate(`/booking-status/${submittedBooking.id}`)}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Track Live Status Online</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="py-3 px-5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubmittedBooking(null);
              setPickupLocation('');
              setDropLocation('');
            }}
            className="py-3 px-5 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Book Another Cab
          </button>
        </div>
      </div>
    );
  }

  // MAIN BOOKING FORM
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10">
      {/* Form Title & Subtitle */}
      <div className="border-b border-slate-200/90 pb-6 mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Kolhapur Cab Booking Request
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Complete the steps below. We will review vehicle availability and contact you within 15–30 minutes to confirm your ride.
        </p>
      </div>

      {errors.form && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Trip Itinerary */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-extrabold">1</span>
            <span>Trip Type & Route Details</span>
          </h3>

          {/* Trip Type Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'one-way', label: 'One-Way Trip' },
              { id: 'round-trip', label: 'Round Trip' },
              { id: 'local', label: 'Local (8hr/80km)' },
              { id: 'airport', label: 'Airport Drop' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setTripType(type.id);
                  if (type.id === 'local') {
                    setDropLocation('Kolhapur Sightseeing & Temple Circuit');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center ${
                  tripType === type.id
                    ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Pickup & Drop Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Pickup Location in Kolhapur *</span>
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => {
                  setPickupLocation(e.target.value);
                  if (errors.pickupLocation) setErrors({ ...errors, pickupLocation: null });
                }}
                list="form-pickup-options"
                placeholder="e.g. Central Bus Stand, Rajarampuri, Shivaji Peth"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                  errors.pickupLocation ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
              <datalist id="form-pickup-options">
                {mockSettings.popularPickupLocations.map((loc, i) => (
                  <option key={i} value={loc} />
                ))}
              </datalist>
              {errors.pickupLocation && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.pickupLocation}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Drop Destination *</span>
              </label>
              <input
                type="text"
                value={dropLocation}
                onChange={(e) => {
                  setDropLocation(e.target.value);
                  if (errors.dropLocation) setErrors({ ...errors, dropLocation: null });
                }}
                list="form-drop-options"
                placeholder="e.g. Pune Airport, Goa Calangute, Mumbai T2"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                  errors.dropLocation ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
              <datalist id="form-drop-options">
                {mockSettings.popularDropLocations.map((loc, i) => (
                  <option key={i} value={loc} />
                ))}
              </datalist>
              {errors.dropLocation && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.dropLocation}</p>
              )}
            </div>
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Pickup Date *</span>
              </label>
              <input
                type="date"
                min={today}
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value);
                  if (errors.pickupDate) setErrors({ ...errors, pickupDate: null });
                }}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                  errors.pickupDate ? 'border-rose-400' : 'border-slate-300 focus:border-amber-500'
                }`}
              />
              {errors.pickupDate && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.pickupDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Pickup Time *</span>
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => {
                  setPickupTime(e.target.value);
                  if (errors.pickupTime) setErrors({ ...errors, pickupTime: null });
                }}
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                  errors.pickupTime ? 'border-rose-400' : 'border-slate-300 focus:border-amber-500'
                }`}
              />
              {errors.pickupTime && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.pickupTime}</p>
              )}
            </div>

            {tripType === 'round-trip' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Return Date *</span>
                </label>
                <input
                  type="date"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    if (errors.returnDate) setErrors({ ...errors, returnDate: null });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                    errors.returnDate ? 'border-rose-400' : 'border-slate-300 focus:border-amber-500'
                  }`}
                />
                {errors.returnDate && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.returnDate}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Passengers</span>
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium focus:border-amber-500"
                >
                  <option value={1}>1 Passenger</option>
                  <option value={2}>2 Passengers</option>
                  <option value={3}>3 Passengers</option>
                  <option value={4}>4 Passengers (Standard Sedan)</option>
                  <option value={6}>6 Passengers (Ertiga SUV)</option>
                  <option value={7}>7 Passengers (Innova Crysta)</option>
                  <option value={17}>17 Passengers (Tempo Traveller)</option>
                  <option value={26}>26 Passengers (Mini-Bus)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Vehicle Selection & Luggage */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-extrabold">2</span>
            <span>Select Vehicle Model & Luggage</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockVehicles.map((veh) => {
              const isSelected = veh.id === vehicleId;
              return (
                <div
                  key={veh.id}
                  onClick={() => setVehicleId(veh.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase text-slate-500">{veh.category}</span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                      ₹{veh.pricing.ratePerKm}/km
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {veh.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {veh.capacity.passengers} seats
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {veh.capacity.luggage} bags
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                <span>Luggage Bags Count</span>
              </label>
              <select
                value={luggage}
                onChange={(e) => setLuggage(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium focus:border-amber-500"
              >
                <option value={0}>No Luggage (Handbags only)</option>
                <option value={1}>1 Medium Bag</option>
                <option value={2}>2 Medium / Large Bags</option>
                <option value={3}>3 Large Bags</option>
                <option value={4}>4 Large Bags</option>
                <option value={6}>6+ Bags (SUV / Carrier Needed)</option>
              </select>
            </div>

            {/* Estimated Fare Display Box */}
            <div className="p-4 bg-navy-950 text-white rounded-2xl flex items-center justify-between border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
                  Estimated Fare ({effectiveDistance} km approx)
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
                  ₹{estimatedFare.toLocaleString('en-IN')}*
                </span>
              </div>
              <span className="text-[11px] text-slate-400 text-right max-w-[120px]">
                * Tolls & state permits as applicable.
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Passenger Contact Information */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-extrabold">3</span>
            <span>Passenger Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Your Full Name *</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) setErrors({ ...errors, customerName: null });
                }}
                placeholder="e.g. Ramesh Patil"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                  errors.customerName ? 'border-rose-400' : 'border-slate-300 focus:border-amber-500'
                }`}
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Indian Mobile Number *</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (errors.customerPhone) setErrors({ ...errors, customerPhone: null });
                }}
                placeholder="e.g. 98220 12345"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                  errors.customerPhone ? 'border-rose-400' : 'border-slate-300 focus:border-amber-500'
                }`}
              />
              {errors.customerPhone && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.customerPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (errors.customerEmail) setErrors({ ...errors, customerEmail: null });
                }}
                placeholder="e.g. ramesh.patil@example.com"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none font-medium transition ${
                  errors.customerEmail ? 'border-rose-400' : 'border-slate-300 focus:border-amber-500'
                }`}
              />
              {errors.customerEmail && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.customerEmail}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Additional Instructions / Requests (Optional)</span>
            </label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Flight flight number & landing time, specific temple stops in Kolhapur, need GST invoice, senior citizen assistance..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submit & Dispatch Reassurance */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="p-4.5 bg-slate-100/80 rounded-2xl flex items-start gap-3 border border-slate-200/80">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Transparent Procedure:</strong> Submitting creates a request with status <strong>PENDING</strong>. No upfront payment is required. Our Kolhapur dispatch desk will verify cab availability and contact you within 15–30 minutes to finalize vehicle confirmation.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-8 rounded-2xl text-base font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-500 shadow-md shadow-amber-500/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Booking Request...</span>
            ) : (
              <>
                <span>Submit Booking Request</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
