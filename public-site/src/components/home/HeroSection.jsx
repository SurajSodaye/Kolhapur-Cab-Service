import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Star, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Calendar,
  Sparkles,
  Plane,
  Car
} from 'lucide-react';
import QuickBookingCard from './QuickBookingCard';
import { mockSettings } from '../../data/mockContent';

export default function HeroSection() {
  const officialPhone = "+91 9529998320";
  const phoneTelLink = "tel:+919529998320";

  // High-Resolution Western Ghats Commercial Automotive Highway Travel Image
  const preferredHeroImage = "/hero-western-ghats.jpg";
  const fallbackHeroImage = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=85";

  const [currentImage, setCurrentImage] = useState(preferredHeroImage);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload image with graceful fallback handling
    const img = new Image();
    img.src = preferredHeroImage;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      setCurrentImage(fallbackHeroImage);
      setImageLoaded(true);
    };
  }, [preferredHeroImage, fallbackHeroImage]);

  return (
    <section className="relative min-h-[660px] lg:min-h-[720px] text-white pt-8 pb-16 sm:pt-12 sm:pb-24 overflow-hidden flex items-center bg-navy-950">
      {/* Scenic Western Ghats Highway Travel Background Image (White SUV on misty winding road) */}
      <div 
        className={`absolute inset-0 bg-cover bg-[75%_center] sm:bg-[78%_center] md:bg-[80%_center] lg:bg-[82%_center] scale-105 transform motion-safe:transition-all motion-safe:duration-1000 ${
          imageLoaded ? 'opacity-100' : 'opacity-90'
        }`}
        style={{
          backgroundImage: `url('${currentImage}')`,
        }}
        aria-hidden="true"
      />

      {/* Subtle Dual-Zone Gradient Overlay: 
          - Strong dark contrast on the left for maximum text readability and visual hierarchy
          - Soft, natural transparency on the right to showcase the misty green mountains, winding highway, and vehicle */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/35 lg:to-navy-950/20 pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-navy-950/30 pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-4 motion-safe:animate-fade-in-up">
        {/* Top Kolhapur Tagline Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/85 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-card backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>Reliable Cab Services in Kolhapur • 24x7 Ready Fleet</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Left Column: Headline, Bio & Value Props */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-extrabold tracking-tight font-heading leading-[1.12] text-white drop-shadow-sm">
              Comfortable Local & Outstation Travel from{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 drop-shadow-[0_2px_15px_rgba(245,158,11,0.25)]">
                Kolhapur
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl font-normal drop-shadow-sm">
              Punctual, air-conditioned taxis for outstation trips across Maharashtra, Goa, and Karnataka, plus city pilgrimage packages to Shri Mahalaxmi Ambabai Temple and Jyotiba Hills. Transparent fares with 24/7 customer support.
            </p>

            {/* Core Value Highlights as Glassmorphic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-sm shadow-sm hover:border-slate-600 transition">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium leading-tight">Verified Chauffeurs with Ghat Expertise</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-sm shadow-sm hover:border-slate-600 transition">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium leading-tight">Transparent Rates & Zero Surge</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-sm shadow-sm hover:border-slate-600 transition">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium leading-tight">Pune, Mumbai & Goa Airport Drops</span>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-sm shadow-sm hover:border-slate-600 transition">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200 font-medium leading-tight">Clean Sanitized Sedans & SUVs</span>
              </div>
            </div>

            {/* Prominent Action Buttons: "Book Your Ride" and "Call Now" */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-500 shadow-md shadow-amber-500/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Book Your Ride</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={phoneTelLink}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-600/90 shadow-card transition-all transform hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm"
                title={`Call official helpline: ${officialPhone}`}
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Now: {officialPhone}</span>
              </a>
            </div>

            {/* Social Proof & Trust Counters */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
                  {mockSettings.stats.happyRiders}
                </p>
                <p className="text-xs text-slate-300 font-medium">Safe Passengers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                  {mockSettings.stats.activeCabs}
                </p>
                <p className="text-xs text-slate-300 font-medium">Available Cabs</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                    {mockSettings.stats.customerRating}
                  </span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <p className="text-xs text-slate-300 font-medium">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Booking Form Widget */}
          <div className="lg:col-span-6">
            <QuickBookingCard />
          </div>
        </div>
      </div>
    </section>
  );
}
