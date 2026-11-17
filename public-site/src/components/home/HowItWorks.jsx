import React from 'react';
import { 
  Search, 
  Send, 
  PhoneCall, 
  Car, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "Choose Route & Cab",
      desc: "Select your pickup location in Kolhapur, destination, travel date, time, and preferred vehicle (Sedan, SUV, or Tempo Traveller)."
    },
    {
      num: "02",
      icon: Send,
      title: "Submit Booking Request",
      desc: "Fill in passenger details and submit. You instantly receive a unique booking reference (e.g. KCS-2026-XXXX) with PENDING status."
    },
    {
      num: "03",
      icon: PhoneCall,
      title: "Rapid Dispatch Review",
      desc: "Our Kolhapur travel desk verifies vehicle schedule and calls or WhatsApps you within 15-30 minutes to confirm booking details and fare."
    },
    {
      num: "04",
      icon: Car,
      title: "Chauffeur Assigned & Ride",
      desc: "Driver details arrive via SMS/WhatsApp. Your sanitized AC cab arrives 15 minutes before scheduled pickup. Pay by cash or UPI."
    }
  ];

  return (
    <section className="py-20 bg-navy-950 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700/80 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">
            How Cab Booking Works With Us
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Transparent, predictable booking backed by our Kolhapur dispatch headquarters.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-subtle group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-700 font-heading">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 text-center">
          <Link
            to="/booking"
            className="btn-primary px-8 py-3.5 text-base"
          >
            <span>Start Your Booking Request</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-slate-400 mt-2.5">
            No advance credit card required. Final confirmation provided by our Kolhapur dispatch desk.
          </p>
        </div>
      </div>
    </section>
  );
}
