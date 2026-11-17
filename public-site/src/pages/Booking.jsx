import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/common/SEO';
import BookingForm from '../components/booking/BookingForm';
import { Phone, ShieldCheck, Clock, MessageCircle, MapPin, Sparkles } from 'lucide-react';
import { mockSettings } from '../data/mockContent';

export default function Booking() {
  const location = useLocation();
  const initialState = location.state || {};

  return (
    <>
      <SEO
        title="Book a Cab — Kolhapur Cab Service"
        description="Submit your online cab booking request for outstation or local travel from Kolhapur. Instant reference ID with PENDING review status."
      />

      <main className="bg-slate-50 min-h-screen py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Direct Kolhapur Dispatch Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
              Book Your Kolhapur Taxi
            </h1>
            <p className="mt-2 text-base text-slate-600 leading-relaxed">
              Fill in your travel itinerary below. No upfront payment required to place your booking request.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Form (8 Cols) */}
            <div className="lg:col-span-8">
              <BookingForm initialState={initialState} />
            </div>

            {/* Right Sidebar Reassurance (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Need Immediate Booking? */}
              <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-7 shadow-premium border border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Need Cab Under 30 Mins?
                </span>
                <h3 className="text-lg font-bold font-heading mb-2">
                  Call Kolhapur Dispatch Directly
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  For emergency airport runs or urgent midnight pickups, speaking directly with our Station Road dispatch manager is fastest.
                </p>

                <div className="space-y-2.5">
                  <a
                    href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {mockSettings.contact.primaryPhone}</span>
                  </a>

                  <a
                    href={`https://wa.me/${mockSettings.contact.whatsappNumber}?text=Urgent%20Cab%20Requirement%20in%20Kolhapur`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Dispatcher</span>
                  </a>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card space-y-4">
                <h4 className="text-xs font-bold text-slate-900 font-heading uppercase tracking-wider">
                  Our Service Guarantees
                </h4>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">100% Verified Chauffeurs</h5>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Experienced with steep ghat driving & polite Maharashtrian hospitality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">On-Time Pickup Guarantee</h5>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Chauffeur arrives 15 minutes before scheduled departure time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Kolhapur Station Rd Desk</h5>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Physical walk-in office opposite CBS for total peace of mind.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
