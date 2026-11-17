import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  BadgeIndianRupee, 
  Sparkles, 
  Award, 
  Headphones,
  CheckCircle,
  MapPin,
  Car
} from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: BadgeIndianRupee,
      title: "100% Transparent Fares",
      description: "Zero hidden charges, surge surprises, or unannounced night driver fees. Full clarity on toll taxes, parking, and driver allowance before trip commencement.",
      badge: "No Hidden Costs"
    },
    {
      icon: Award,
      title: "Verified Local Chauffeurs",
      description: "Background-checked native chauffeurs trained specifically for Western Ghat routes (Amboli, Gaganbawda, Pasarni). Courteous, uniformed, and safety-tested.",
      badge: "Ghat Experts"
    },
    {
      icon: Sparkles,
      title: "Spotless Sanitized AC Cabs",
      description: "Vehicles undergo comprehensive interior vacuuming and sanitization after every trip. Dual-zone and ducted AC performance guaranteed on highway journeys.",
      badge: "Chilled AC"
    },
    {
      icon: Clock,
      title: "Guaranteed On-Time Pickup",
      description: "Never worry about missing morning flights or train departures. Your assigned chauffeur arrives at your Kolhapur address 15 minutes before scheduled time.",
      badge: "Punctuality Guarantee"
    },
    {
      icon: Headphones,
      title: "24/7 Kolhapur Dispatch Desk",
      description: "Real humans based at our Station Road desk assist you round-the-clock with live booking updates, route coordination, and flight delay adjustments.",
      badge: "Always Available"
    },
    {
      icon: ShieldCheck,
      title: "GPS-Monitored Highway Safety",
      description: "Fastag-enabled highway transit with real-time GPS fleet monitoring and emergency protocols for peace of mind during midnight outstation travel.",
      badge: "Safe Rides"
    }
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Why Kolhapur Travelers Trust Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            The Kolhapur Cab Service Standard
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            We are Kolhapur’s dedicated local taxi network committed to passenger safety, pristine vehicles, and traditional Maharashtrian hospitality.
          </p>
        </div>

        {/* 6 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-7 shadow-card border border-slate-200/80 card-hover-effect flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-heading mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kolhapur Roots Physical Desk Banner */}
        <div className="mt-14 p-6 sm:p-8 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 text-white rounded-3xl shadow-premium flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold font-heading text-white">
                Locally Owned & Headquartered Opposite Kolhapur Central Bus Stand
              </h4>
              <p className="text-sm text-slate-300 mt-0.5">
                Visit our physical travel desk anytime for on-the-spot cab dispatch or customized pilgrim circuit arrangements.
              </p>
            </div>
          </div>
          <a
            href="tel:+919529998320"
            className="shrink-0 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <span>Call +91 9529998320</span>
          </a>
        </div>
      </div>
    </section>
  );
}
