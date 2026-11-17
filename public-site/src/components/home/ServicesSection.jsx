import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Navigation, 
  Clock, 
  Plane, 
  MapPin, 
  Briefcase, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { getServices } from '../../services/contentService';

const iconMap = {
  Navigation,
  Clock,
  Plane,
  MapPin,
  Briefcase,
  Users
};

export default function ServicesSection() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getServices();
      setServices(data);
    }
    loadData();
  }, []);

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Tailored Travel Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Cabs for Every Journey & Purpose
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Whether catching an early flight from Pune or touring ancient Kolhapur temples, we provide punctual and comfortable rides designed for your itinerary.
          </p>
        </div>

        {/* 6 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((srv) => {
            const IconComponent = iconMap[srv.icon] || Navigation;
            return (
              <div
                key={srv.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card card-hover-effect flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Service Image with Badges & Category Icon */}
                  <div className="relative h-48 overflow-hidden rounded-2xl mb-5 bg-slate-100">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                      {srv.badge}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-sm">
                      {srv.startingPrice}
                    </div>

                    <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 font-heading mb-2 group-hover:text-amber-700 transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {srv.shortDescription}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {srv.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to="/services"
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group/link"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/booking"
                    state={{ serviceId: srv.id, serviceTitle: srv.title }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-subtle"
                  >
                    Book Service
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
