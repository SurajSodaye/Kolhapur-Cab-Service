import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { 
  ShieldCheck, 
  MapPin, 
  Award, 
  Users, 
  Car, 
  HeartHandshake, 
  CheckCircle2,
  Sparkles,
  Phone
} from 'lucide-react';
import { mockSettings } from '../data/mockContent';

export default function About() {
  const values = [
    {
      title: "Passenger Safety First",
      desc: "Every vehicle is Fastag and GPS-enabled, and drivers undergo stringent police verification and highway defense driving training."
    },
    {
      title: "Punctuality & Reliability",
      desc: "We understand the anxiety of catching early-morning Pune flights or train departures. Our cabs arrive at your door 15 minutes ahead of schedule."
    },
    {
      title: "Radical Fare Transparency",
      desc: "No surge pricing, hidden extra kilometers, or unannounced night driver fees. What we quote is what you pay."
    },
    {
      title: "Warm Kolhapuri Hospitality",
      desc: "Courteous drivers who assist senior citizens, guide pilgrims through Mahalaxmi Temple queues, and know the finest Misal stops."
    }
  ];

  return (
    <>
      <SEO
        title="About Us — Kolhapur Cab Service"
        description="Learn about Kolhapur Cab Service, Kolhapur's trusted taxi fleet located opposite Central Bus Stand. Dedicated to safe highway and pilgrim journeys."
      />

      <main className="bg-slate-50 min-h-screen pb-20">
        {/* Hero Header */}
        <div className="bg-navy-950 text-white py-16 sm:py-24 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rooted in Karveer Nagari</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading max-w-3xl">
              Kolhapur’s Most Trusted Highway & Pilgrim Taxi Network
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Founded with a singular mission: to provide travellers departing from or arriving in Kolhapur with pristine, honest, and delightfully punctual private cab travel.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-5 text-slate-700 leading-relaxed">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block">
                  Our Background & Heritage
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  Born Out of a Passion for Safe Maharashtrian Road Travel
                </h2>
                <p>
                  Kolhapur is more than a bustling commercial center — it is the historic realm of Chhatrapati Shahu Maharaj and the sacred abode of Goddess Mahalaxmi Ambabai. Every day, thousands of pilgrims, corporate executives heading to industrial MIDC zones, and families traveling toward Pune, Mumbai, or the beaches of Goa rely on highway transit.
                </p>
                <p>
                  For years, travelers faced unreliable aggregators who cancelled at the last minute or overcharged with mysterious surge fees. <strong>Kolhapur Cab Service</strong> was established to change that narrative completely. Headquartered directly opposite the Kolhapur Central Bus Stand (CBS) on Station Road, we combine modern fleet operations with authentic local accountability.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-2xl font-extrabold text-amber-600 font-heading">85+ Cabs</p>
                    <p className="text-xs text-slate-500">Maintained Company & Partner Fleet</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-slate-900 font-heading">25,000+</p>
                    <p className="text-xs text-slate-500">Satisfied Travelers Across India</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden shadow-md border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
                    alt="Kolhapur Cab Fleet"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                    <p className="text-white text-sm font-semibold">
                      Our spotless sedan and SUV fleet stationed on Station Road, Kolhapur
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Our Guiding Principles
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Every trip we dispatch is governed by standards that protect your comfort and safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card card-hover-effect">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-heading mb-2">
                  {v.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Office & Operations Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium border border-slate-800">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Physical Office & Walk-In Desk
              </span>
              <h3 className="text-2xl font-bold font-heading">
                Visit Us at Kolhapur Central Bus Stand
              </h3>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                {mockSettings.contact.officeAddress}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Open 24 Hours / 7 Days a Week for Inquiries & Departures</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a
                href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call {mockSettings.contact.primaryPhone}</span>
              </a>

              <Link
                to="/booking"
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors text-center"
              >
                Book a Cab
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
