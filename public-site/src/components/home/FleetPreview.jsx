import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Wind, Check, ArrowRight, Star, ShieldCheck, Car } from 'lucide-react';
import { getFeaturedVehicles } from '../../services/vehicleService';
import Badge from '../common/Badge';

export default function FleetPreview() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getFeaturedVehicles(4);
        setVehicles(data);
      } catch (err) {
        console.error('Failed to load fleet', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <section className="py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Car className="w-3.5 h-3.5 text-amber-600" />
              <span>Our Maintained Fleet</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
              Comfortable, Modern & Sanitized Cabs
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              From economic executive sedans for quick airport drops to luxury Innova Crystas and spacious Tempo Travellers for family pilgrimages.
            </p>
          </div>

          <Link
            to="/fleet"
            className="inline-flex items-center gap-2 font-bold text-amber-700 hover:text-amber-800 text-sm group shrink-0"
          >
            <span>Explore All 6 Fleet Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Fleet Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-3xl h-96" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-card card-hover-effect flex flex-col overflow-hidden group"
              >
                {/* Vehicle Image & Badges */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={v.image}
                    alt={v.altText || `${v.name} - ${v.category} Kolhapur Cab`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      if (v.imageFallback && e.currentTarget.src !== v.imageFallback) {
                        e.currentTarget.src = v.imageFallback;
                      }
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {v.badge && (
                      <Badge variant="primary" size="sm">
                        {v.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{v.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                      <span className="uppercase tracking-wider">{v.category}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                        ₹{v.pricing.ratePerKm}/km
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-amber-700 transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {v.tagline}
                    </p>

                    {/* Capacity Specs */}
                    <div className="grid grid-cols-2 gap-2 my-4 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{v.capacity.passengers} Passengers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span>{v.capacity.luggage} Bags</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 text-slate-500 text-[11px]">
                        <Wind className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.acType}</span>
                      </div>
                    </div>

                    {/* Quick features */}
                    <ul className="space-y-1.5 text-xs text-slate-600 mb-5">
                      {v.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Booking CTA Button */}
                  <Link
                    to="/booking"
                    state={{ vehicleId: v.id, vehicleCategory: v.category }}
                    className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-subtle flex items-center justify-center gap-1.5"
                  >
                    <span>Book {v.name.split('/')[0].trim()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
