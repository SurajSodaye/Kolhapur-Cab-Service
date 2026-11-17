import React from 'react';
import SEO from '../components/common/SEO';
import { FileText, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { mockSettings } from '../data/mockContent';

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms and Conditions — Kolhapur Cab Service"
        description="Review the terms and conditions for booking and traveling with Kolhapur Cab Service. Policies on pending status, cancellations, and passenger conduct."
      />

      <main className="bg-slate-50 min-h-screen py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-8 sm:p-12 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Service Agreement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                Terms and Conditions
              </h1>
              <p className="text-xs text-slate-500 mt-2">
                Effective Date: November 2026 • Kolhapur Cab Service (KCS)
              </p>
            </div>

            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-6">
              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">1. Booking Request & Status Confirmation</h2>
                <div className="p-4.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-950 text-xs sm:text-sm font-medium leading-relaxed">
                  <strong>Crucial Provision:</strong> Submitting a booking form on our website generates a <strong>PENDING</strong> booking request with a unique reference number. <strong>This does not constitute an instant confirmed cab booking.</strong> A binding confirmation is established only after our Kolhapur dispatch desk verifies vehicle availability and contacts the passenger via phone/WhatsApp to lock in vehicle assignment.
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">2. Fares, Tolls, and Taxes</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Outstation Kilometers:</strong> For outstation round trips, a minimum daily limit of 250 km (for hatchbacks) or 300 km (for sedans, SUVs, and Tempo Travellers) is calculated on a calendar-day basis (midnight to midnight).</li>
                  <li><strong>Tolls & State Border Tax:</strong> Highway toll plazas, parking tickets, and inter-state permits (such as Maharashtra to Karnataka or Goa entry permits) are billed at actuals via Fastag or government receipts unless explicitly bundled into a fixed package quote.</li>
                  <li><strong>Driver Night Halt Allowance:</strong> Applicable on outstation round trips between 10:00 PM and 6:00 AM as per the vehicle category rate table.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">3. Punctuality & Flight Delays</h2>
                <p>
                  While our drivers make every effort to arrive 15 minutes before scheduled pickup, Kolhapur Cab Service is not liable for delays caused by extreme highway accidents, natural landslides in the Western Ghats (e.g. Amboli or Gaganbawda), or severe national road closures. For airport drops, passengers are advised to maintain sufficient buffer time.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">4. Passenger Conduct & Vehicle Care</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Smoking, consumption of alcohol, or use of illegal substances inside the cab is strictly prohibited under Indian Motor Vehicles Act.</li>
                  <li>Passengers are expected to treat chauffeurs with dignity and respect.</li>
                  <li>In the event of accidental vehicle interior soiling, a nominal sanitization cleaning fee may be levied.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">5. Cancellation & Modification Guidelines</h2>
                <p>
                  Bookings cancelled at least 2 hours prior to scheduled departure incur zero penalty. If a passenger modifies their itinerary after dispatch, fare adjustments will be computed transparently based on revised kilometer distances.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 font-heading">6. Governing Jurisdiction</h2>
                <p>
                  Any disputes or claims arising out of services provided by Kolhapur Cab Service shall be subject to the exclusive jurisdiction of the competent courts in <strong>Kolhapur, Maharashtra, India</strong>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
