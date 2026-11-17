import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { HelpCircle, ChevronDown, Search, PhoneCall, Sparkles } from 'lucide-react';
import { mockSettings } from '../data/mockContent';
import { Link } from 'react-router-dom';

const allFaqCategories = [
  {
    category: "Booking & Status",
    items: [
      {
        q: "How does the online cab booking process work?",
        a: "When you submit your trip details through our website, a booking reference (e.g. KCS-2026-XXXX) is generated with status 'PENDING'. Our Kolhapur dispatch desk reviews vehicle allocation and route feasibility, then calls or WhatsApps you within 15 to 30 minutes to confirm vehicle assignment and fare details. We never falsely claim a cab is confirmed before driver allocation is completed."
      },
      {
        q: "How do I check the status of my booking?",
        a: "You can visit our 'Track Booking' page anytime and enter your Booking Reference number (or registered mobile number). You will see real-time status transitions: PENDING, UNDER_REVIEW, CONFIRMED, DRIVER_ASSIGNED, or COMPLETED, along with assigned chauffeur details once finalized."
      },
      {
        q: "How much advance notice is required to book a taxi?",
        a: "For outstation journeys (Pune, Mumbai, Goa), we recommend booking at least 3–4 hours in advance. For early morning airport drops (between 1 AM and 6 AM), please book the previous evening before 9 PM so we can dispatch your chauffeur on time."
      },
      {
        q: "What is your trip cancellation policy?",
        a: "We do not charge cancellation fees if you cancel more than 2 hours before your scheduled pickup time. If the driver is already en route to your doorstep, a nominal dry-run fee may apply."
      }
    ]
  },
  {
    category: "Fares, Tolls & Payments",
    items: [
      {
        q: "Are toll taxes and parking included in the fare?",
        a: "For one-way airport drops and outstation trips, quotes will specify if tolls are included or billed at actuals via electronic Fastag. Parking fees at airports or railway stations are payable at actuals."
      },
      {
        q: "What payment methods are supported?",
        a: "We accept all major payment methods including Google Pay, PhonePe, Paytm, BHIM UPI, NetBanking, Debit/Credit cards, and direct cash to the driver at destination."
      },
      {
        q: "Do you provide GST tax invoices for corporate claims?",
        a: "Yes! Provide your company name and GSTIN in the additional instructions box or notify our dispatch team, and we will email your official GST invoice upon trip completion."
      }
    ]
  },
  {
    category: "Vehicles, Chauffeurs & Safety",
    items: [
      {
        q: "Is AC always functional during outstation trips and ghat roads?",
        a: "Yes, all our sedans, SUVs, and Tempo Travellers have fully operational, chilled air conditioning. On steep hill climbs in the ghats, drivers may temporarily switch to fan mode for safety, but AC remains on throughout the journey."
      },
      {
        q: "Are your drivers trained for Western Ghats and mountain routes?",
        a: "Yes. All our drivers are verified local professionals with extensive experience driving through Amboli Ghat, Gaganbawda, Pasarni Ghat, and Mumbai-Pune expressway in both heavy monsoon fog and night conditions."
      },
      {
        q: "Are child car seats or rooftop luggage carriers available?",
        a: "Overhead luggage carriers are fitted on our Ertiga and Tempo Traveller fleets upon request. Child seats can be arranged if requested 24 hours in advance."
      }
    ]
  },
  {
    category: "Kolhapur Pilgrimage & Darshan",
    items: [
      {
        q: "Can the driver guide us through Shri Mahalaxmi Temple queues?",
        a: "Our local drivers know the best parking spots closest to Mahadwar and can advise you on VIP pass counters, queue times, and optimal darshan hours."
      },
      {
        q: "Can we include Panhala Fort and Jyotiba Hills on the same day?",
        a: "Yes! Our Kolhapur Full-Day Circuit comfortably covers Shri Mahalaxmi Ambabai Mandir in the morning, Jyotiba Temple at noon, and Panhala Fort for sunset."
      }
    ]
  }
];

export default function Faq() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState({ '0-0': true });

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = allFaqCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <>
      <SEO
        title="Frequently Asked Questions — Kolhapur Cab Service"
        description="Find answers to all questions regarding cab booking, outstation fares, temple pilgrimage packages, cancellation rules, and driver safety."
      />

      <main className="bg-slate-50 min-h-screen pb-20">
        {/* Header */}
        <div className="bg-navy-950 text-white py-14 sm:py-20 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Help & Travel Policies</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Clear answers about booking policies, fares, safety measures, and Kolhapur sightseeing.
            </p>

            {/* Search filter */}
            <div className="max-w-xl mx-auto mt-8 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search question keywords (e.g. airport, cancellation, tolls)..."
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-card">
              <p className="text-slate-600 font-bold">No questions found matching "{searchTerm}".</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs font-bold text-amber-700 underline"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredCategories.map((cat, catIdx) => (
              <div key={catIdx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
                  {cat.category}
                </h2>

                <div className="space-y-3 pt-1">
                  {cat.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const isOpen = !!openItems[key];

                    return (
                      <div
                        key={itemIdx}
                        className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all shadow-subtle"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          className="w-full text-left px-5 py-4 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between gap-4 transition-colors"
                          aria-expanded={isOpen}
                        >
                          <span className="font-bold text-slate-900 text-sm sm:text-base font-heading">
                            {item.q}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                              isOpen ? 'transform rotate-180 text-amber-600' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pt-3 pb-5 bg-white border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Still Need Help Box */}
          <div className="p-8 bg-navy-950 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-premium border border-slate-800">
            <div>
              <h3 className="text-lg font-bold font-heading">Still Have a Question?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Our Kolhapur travel desk is available 24x7 to assist you.
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-500 transition-colors flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {mockSettings.contact.primaryPhone}</span>
              </a>
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                Contact Page
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
