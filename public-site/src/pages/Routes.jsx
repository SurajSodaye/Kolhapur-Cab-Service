import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Fuel, 
  Compass,
  Sparkles
} from 'lucide-react';
import { getRoutes } from '../services/contentService';

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getRoutes();
        setRoutes(data);
      } catch (err) {
        console.error('Failed to load routes', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <SEO
        title="Popular Outstation Cab Routes from Kolhapur — Fares & Distances"
        description="Check transparent taxi fares for outstation routes from Kolhapur to Pune, Mumbai, Goa, Belgaum, Mahabaleshwar, Shirdi, and Ganpatipule."
      />

      <main className="bg-slate-50 min-h-screen pb-20">
        {/* Header */}
        <div className="bg-navy-950 text-white py-14 sm:py-20 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Intercity Highway Express</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading">
              Popular Outstation Taxi Routes
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Doorstep pickup anywhere in Kolhapur. Transparent one-way and round-trip fares with experienced highway and ghat drivers.
            </p>
          </div>
        </div>

        {/* Routes Grid: Equal-Height Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 h-[640px] flex flex-col justify-between">
                  <div className="bg-slate-200 rounded-2xl h-60 w-full" />
                  <div className="space-y-3 mt-4">
                    <div className="h-6 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                    <div className="h-10 bg-slate-200 rounded w-full" />
                  </div>
                  <div className="h-28 bg-slate-200 rounded-2xl" />
                  <div className="h-12 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-card card-hover-effect overflow-hidden flex flex-col justify-between h-full group"
                >
                  {/* Top: Route Image with Badges */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={route.image}
                      alt={route.altText || `${route.source} to ${route.destination} Cab`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        if (route.imageFallback && e.currentTarget.src !== route.imageFallback) {
                          e.currentTarget.src = route.imageFallback;
                        }
                      }}
                    />
                    
                    {/* Top Tag */}
                    <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md text-amber-400 font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                      {route.tag}
                    </div>

                    {/* Gradient Overlay for bottom text */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

                    {/* Bottom Metadata Badges */}
                    <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/10 font-semibold">
                          <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{route.distanceKm} km</span>
                        </span>
                        <span className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/10 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{route.estimatedDuration}</span>
                        </span>
                      </div>
                      <div className="bg-amber-400 text-slate-950 font-extrabold px-3 py-1 rounded-lg shadow-sm">
                        From ₹{route.startingPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    {/* Route Destination Title & Route Info */}
                    <div>
                      <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 font-heading mb-1 truncate">
                        <span className="text-slate-900">{route.source}</span>
                        <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-amber-700">{route.destination}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate mt-1">
                        <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{route.highway}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mt-2.5 line-clamp-2 h-10">
                        {route.description}
                      </p>
                    </div>

                    {/* Standardized 3 Highlights */}
                    <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/60">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Route Highlights</span>
                      </div>
                      <div className="space-y-1.5">
                        {route.highlights.slice(0, 3).map((hl, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Standardized Vehicle Fare Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                        <span>Vehicle Category</span>
                        <span>Estimated One-Way</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {route.faresByVehicle && Object.entries(route.faresByVehicle).map(([veh, fare]) => (
                          <div key={veh} className="flex items-center justify-between py-0.5">
                            <span className="text-slate-600 font-medium">{veh}</span>
                            <span className="font-bold text-slate-900">₹{fare.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Round trip starting from:</span>
                        <strong className="text-emerald-700 font-bold">₹{route.roundTripStartingPrice.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-1">
                      <Link
                        to="/booking"
                        state={{
                          pickupLocation: route.source,
                          dropLocation: route.destination,
                          estimatedDistanceKm: route.distanceKm,
                          estimatedFare: route.startingPrice
                        }}
                        className="w-full py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-subtle flex items-center justify-center gap-2 group/btn"
                      >
                        <span>Book This Trip</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
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
