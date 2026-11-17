import React from 'react';
import SEO from '../components/common/SEO';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { mockSettings } from '../data/mockContent';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy — Kolhapur Cab Service"
        description="Read the Privacy Policy of Kolhapur Cab Service. How we collect, store, and protect your personal and trip information."
      />

      <main className="bg-slate-50 min-h-screen py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Privacy & Data Protection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-500 mt-2">
                Last Updated: November 2026 • Kolhapur Cab Service (KCS)
              </p>
            </div>

            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-6">
              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">1. Introduction</h2>
                <p>
                  Kolhapur Cab Service ("we", "our", or "us"), located opposite Central Bus Stand (CBS), Station Road, Kolhapur, Maharashtra, is committed to safeguarding the privacy and security of users ("you", "passenger") who interact with our website and cab booking services.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">2. Information We Collect</h2>
                <p>To process your cab booking requests, we collect the following information:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Personal Identification:</strong> Full name, Indian mobile phone number, email address.</li>
                  <li><strong>Journey Coordinates:</strong> Pickup address in Kolhapur, drop destination, pickup date, pickup time, return date, passenger count, luggage details.</li>
                  <li><strong>Trip Preferences:</strong> Specific instructions, darshan requirements, GSTIN for corporate invoicing.</li>
                  <li><strong>Technical Usage:</strong> Browser user-agent and IP address for fraud prevention and system security.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">3. How We Use Your Data</h2>
                <p>We use the information strictly for:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Contacting you to confirm vehicle availability, dispatch schedules, and fare quotes.</li>
                  <li>Sharing your pickup address with the assigned verified chauffeur.</li>
                  <li>Sending automated SMS or WhatsApp trip confirmations and driver assignment alerts.</li>
                  <li>Generating valid tax invoices and addressing customer support inquiries.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">4. Data Sharing & Third Parties</h2>
                <p>
                  We never sell, rent, or trade your personal data to marketing third parties. Your name, contact number, and pickup location are shared exclusively with the assigned driver and our internal Kolhapur dispatch operators for the execution of the booked journey.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">5. Data Storage & Security</h2>
                <p>
                  All personal records are encrypted in transit and at rest using standard industry safeguards. Access is restricted to authorized personnel managing the Kolhapur Cab Service dispatch operations.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">6. Contact Data Protection Officer</h2>
                <p>
                  If you have questions regarding your data or wish to request data erasure, please contact our Kolhapur office:
                </p>
                <p className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <strong>Kolhapur Cab Service</strong><br />
                  Shop No. 14, Royal Complex, Opp. CBS, Station Road, Kolhapur 416001<br />
                  Email: {mockSettings.contact.supportEmail}<br />
                  Phone: {mockSettings.contact.primaryPhone}
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
