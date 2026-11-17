import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { 
  Navigation, 
  Clock, 
  Plane, 
  MapPin, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall,
  Sparkles 
} from 'lucide-react';
import { getServices } from '../services/contentService';
import { mockSettings } from '../data/mockContent';

const iconMap = {
  Navigation,
  Clock,
  Plane,
  MapPin,
  Briefcase,
  Users
};

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getServices();
      setServices(data);
    }
    loadData();
  }, []);

  return (
    <>
      <SEO
        title="Cab Services & Packages in Kolhapur — Outstation, Local & Airport"
        description="Comprehensive cab services in Kolhapur: Outstation taxi, 8hr/80km local hire, airport transfers to Pune & Mumbai, temple pilgrimage circuits, and corporate rentals."
      />

      <main className="bg-slate-50 min-h-screen pb-20">
        {/* Header */}
        <div className="bg-navy-950 text-white py-14 sm:py-20 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full-Spectrum Mobility Solutions</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading">
              Our Taxi Services & Rental Packages
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              From reliable one-way highway drops to full-day temple sightseeing and corporate fleets across western Maharashtra.
            </p>
          </div>
        </div>

        {/* Services Detail List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
          {services.map((srv, idx) => {
            const IconComponent = iconMap[srv.icon] || Navigation;
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={srv.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-card card-hover-effect p-6 sm:p-10"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Image Column */}
                  <div className={`lg:col-span-5 ${isReversed ? 'lg:order-2' : ''}`}>
                    <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 shadow-md group">
                      <img
                        src={srv.image}
                        alt={srv.altText || srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          if (srv.imageFallback && e.currentTarget.src !== srv.imageFallback) {
                            e.currentTarget.src = srv.imageFallback;
                          }
                        }}
                      />
                      <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md text-amber-400 font-bold text-xs px-3 py-1.5 rounded-full">
                        {srv.badge}
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white/95 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-md">
                        {srv.startingPrice}
                      </div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className={`lg:col-span-7 space-y-4 ${isReversed ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Package Category
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                          {srv.title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {srv.fullDescription}
                    </p>

                    {/* Features checklist */}
                    <div className="pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Included Features & Benefits:
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {srv.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Popular stops */}
                    {srv.popularDestinations && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Frequent Stops:</span>
                        {srv.popularDestinations.map((dest, i) => (
                          <span
                            key={i}
                            className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-lg border border-slate-200/60"
                          >
                            {dest}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA Actions */}
                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <Link
                        to="/booking"
                        state={{ serviceId: srv.id, serviceTitle: srv.title }}
                        className="btn-primary"
                      >
                        <span>Book {srv.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <a
                        href={`https://wa.me/${mockSettings.contact.whatsappNumber}?text=Hello%20Kolhapur%20Cab%20Service%2C%20I%20want%20to%20enquire%20about%20${encodeURIComponent(srv.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>Enquire on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
