import React from 'react';
import { MessageCircle, Phone, Clock, MapPin, ArrowRight } from 'lucide-react';
import { mockSettings } from '../../data/mockContent';
import { Link } from 'react-router-dom';

export default function WhatsAppCtaSection() {
  const whatsappUrl = `https://wa.me/${mockSettings.contact.whatsappNumber}?text=Hello%20Kolhapur%20Cab%20Service%2C%20I%20need%20a%20taxi%20quote`;

  return (
    <section className="py-16 bg-navy-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background shapes & subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-premium flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700/80 text-xs font-bold uppercase tracking-wider mb-4">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Average Response Under 10 Minutes</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight text-white">
              Need an Urgent Cab or Custom Group Itinerary?
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed">
              Connect directly with our Kolhapur dispatch manager on WhatsApp or phone for immediate vehicle confirmation, outstation packages, or wedding fleet planning.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-300">
                <MapPin className="w-3.5 h-3.5" />
                <span>Station Road Desk, Kolhapur</span>
              </span>
              <span>•</span>
              <span>24x7 Ready Fleet</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Instant Fare Quotation</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-extrabold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950 text-emerald-400" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-extrabold text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Phone className="w-5 h-5 text-amber-400" />
              <span>Call +91 9529998320</span>
            </a>

            <Link
              to="/booking"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-md transition-all"
            >
              <span>Book Online</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
