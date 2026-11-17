import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const homeFaqs = [
  {
    q: "How do I know when my cab booking is confirmed?",
    a: "When you submit a booking request online, your reference ID is generated immediately with status 'PENDING'. Our Kolhapur dispatch desk reviews vehicle availability and route conditions, then contacts you via phone or WhatsApp within 15–30 minutes to confirm vehicle assignment and final fare details. We never falsely claim that a cab is confirmed until vehicle allocation is locked in."
  },
  {
    q: "Are highway toll charges and driver allowances included in the quote?",
    a: "We provide 100% transparent pricing. On one-way outstation trips (e.g. Kolhapur to Pune or Mumbai), quotes clearly specify whether tolls and state permits are inclusive or billed at actuals via Fastag. Round-trip bookings have standard driver day allowances (₹400/day for sedans, ₹500 for Innova Crysta) clearly listed with zero hidden surprises."
  },
  {
    q: "Can I book a cab for a 3 AM or 4 AM early morning Pune or Mumbai flight?",
    a: "Yes, absolutely! Our Kolhapur dispatch team operates 24x7. For early morning pickups, we assign chauffeurs the evening prior, and your driver will reach your Kolhapur residence 15 minutes before your scheduled departure time."
  },
  {
    q: "Do you offer customized Kolhapur Darshan and Jyotiba temple tour packages?",
    a: "Yes. We offer special full-day and multi-day spiritual circuit packages covering Shri Ambabai Mahalaxmi Mandir, Jyotiba Temple (Wadi Ratnagiri), Panhala Fort, Narsobawadi Datta Mandir, and Rankala Lake. Drivers are respectful, patient with elderly pilgrims, and accommodate temple darshan schedules."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Google Pay, PhonePe, Paytm, BHIM UPI, NetBanking, credit/debit cards, and direct cash payment to the driver upon reaching your destination. GST tax invoices are provided for corporate clients upon request."
  },
  {
    q: "What happens if my incoming flight to Pune or Goa is delayed?",
    a: "We track live flight arrivals for all airport pickups. We provide complimentary waiting up to 45 minutes after landing time. If your flight is severely delayed, simply inform our 24x7 helpline and we will reschedule your chauffeur accordingly without cancellation penalties."
  }
];

export default function FaqSection({ limit = 6, showFullLink = true }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqsToDisplay = homeFaqs.slice(0, limit);

  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Everything you need to know about booking, fares, and traveling with Kolhapur Cab Service.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqsToDisplay.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all shadow-subtle"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full text-left px-5 py-4 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base font-heading">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pt-3 pb-5 bg-white border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showFullLink && (
          <div className="mt-10 text-center">
            <Link
              to="/faq"
              className="text-sm font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4"
            >
              View all FAQs & travel policies →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
