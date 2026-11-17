import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { 
  Users, 
  Briefcase, 
  Wind, 
  Fuel, 
  Check, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Filter,
  Car 
} from 'lucide-react';
import { getVehicles } from '../services/vehicleService';
import Badge from '../components/common/Badge';

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Sedan', 'SUV', 'Luxury SUV', 'Hatchback', 'Tempo Traveller'];

  useEffect(() => {
    async function loadFleet() {
      setLoading(true);
      try {
        const data = await getVehicles({ category: selectedCategory });
        setVehicles(data);
      } catch (err) {
        console.error('Error loading vehicles', err);
      } finally {
        setLoading(false);
      }
    }
    loadFleet();
  }, [selectedCategory]);

  return (
    <>
      <SEO
        title="Our Cab Fleet — Kolhapur Cab Service"
        description="Browse our fleet of sedans (Dzire), SUVs (Ertiga, Innova Crysta), hatchbacks, and Tempo Travellers (17/26 seaters) with transparent rates per km."
      />

      <main className="bg-slate-50 min-h-screen pb-20">
        {/* Header */}
        <div className="bg-navy-950 text-white py-14 sm:py-20 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified & Maintained Taxi Fleet</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading">
              Our Premium Cab Fleet
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Spotlessly maintained, air-conditioned vehicles driven by professional local chauffeurs. Guaranteed AC on all highway routes.
            </p>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/90 border border-slate-700/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-slate-200/60 rounded-3xl h-[480px]" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto shadow-subtle">
              <p className="text-base font-bold text-slate-700">No vehicles match this category.</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="mt-3 text-xs font-bold text-amber-700 underline"
              >
                Reset to View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-card card-hover-effect flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Image with Badges */}
                    <div className="relative h-56 bg-slate-100 overflow-hidden">
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
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {v.badge && (
                          <Badge variant="primary" size="sm">
                            {v.badge}
                          </Badge>
                        )}
                        <span className="bg-slate-950/85 backdrop-blur-md text-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit">
                          {v.fuelType}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{v.rating}</span>
                        <span className="text-slate-400 font-normal">({v.tripsCompleted}+ trips)</span>
                      </div>
                    </div>

                    {/* Details Body */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                        <span className="uppercase tracking-wider">{v.category}</span>
                        <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 text-sm">
                          ₹{v.pricing.ratePerKm}/km
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 font-heading group-hover:text-amber-700 transition-colors">
                        {v.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {v.tagline}
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 my-5 p-3.5 bg-slate-50 rounded-2xl text-center text-xs text-slate-700 border border-slate-100">
                        <div>
                          <span className="block font-bold text-slate-900">{v.capacity.passengers} Seats</span>
                          <span className="text-[11px] text-slate-500">Capacity</span>
                        </div>
                        <div className="border-x border-slate-200">
                          <span className="block font-bold text-slate-900">{v.capacity.luggage} Bags</span>
                          <span className="text-[11px] text-slate-500">Luggage</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">{v.acType.split(' ')[0]}</span>
                          <span className="text-[11px] text-slate-500">AC System</span>
                        </div>
                      </div>

                      {/* Pricing info */}
                      <div className="mb-4 text-xs text-slate-600 flex justify-between border-b border-slate-100 pb-3">
                        <span>Min Outstation Limit: <strong>{v.pricing.minKmPerDay} km/day</strong></span>
                        <span>Driver Allowance: <strong>₹{v.pricing.driverAllowancePerDay}/day</strong></span>
                      </div>

                      {/* Features */}
                      <div className="space-y-1.5 mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Amenities:</p>
                        {v.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-950 font-medium">
                        <strong>Recommended for:</strong> {v.popularFor}
                      </div>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="p-6 pt-0">
                    <Link
                      to="/booking"
                      state={{ vehicleId: v.id, vehicleCategory: v.category }}
                      className="w-full py-3 px-4 rounded-xl text-center text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-subtle flex items-center justify-center gap-2 group"
                    >
                      <span>Book This {v.category}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
