import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  ArrowRight, 
  Navigation, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { getRoutes } from '../../services/contentService';

export default function PopularRoutesSection() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await getRoutes({ popularOnly: true });
      setRoutes(data.slice(0, 4));
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
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Intercity Highway Express</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
              Popular Outstation Routes from Kolhapur
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Fixed, transparent one-way and round-trip fares with prompt doorstep pickup anywhere in Kolhapur city.
            </p>
          </div>

          <Link
            to="/routes"
            className="inline-flex items-center gap-2 font-bold text-amber-700 hover:text-amber-800 text-sm group shrink-0"
          >
            <span>View All 8 Outstation Routes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-card card-hover-effect flex flex-col justify-between overflow-hidden group h-full"
            >
              <div>
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
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
                  <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-amber-400 font-bold text-[11px] px-2.5 py-1 rounded-full">
                    {route.tag}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-sm">
                    From ₹{route.startingPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-2 h-7 truncate">
                    <span className="text-slate-800 truncate">{route.source}</span>
                    <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-amber-700 truncate">{route.destination}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2 mb-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-slate-400" />
                      <span>{route.distanceKm} km</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{route.estimatedDuration}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 h-10">
                    {route.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-5 pb-5">
                <Link
                  to="/booking"
                  state={{
                    pickupLocation: route.source,
                    dropLocation: route.destination,
                    estimatedDistanceKm: route.distanceKm,
                    estimatedFare: route.startingPrice
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-subtle flex items-center justify-center gap-1.5"
                >
                  <span>Book This Route</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
