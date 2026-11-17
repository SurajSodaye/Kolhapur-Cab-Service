import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Premium Brand Identity Logo for Kolhapur Cab Service (KCS)
 * 
 * Design Concept:
 * 1. Apex Crest: Geometric Destination Pin representing travel, location, and arrival.
 * 2. Executive Silhouette: Dynamic aerodynamic sedan cab profile with rooftop beacon.
 * 3. Road Perspective: Converging highway lines symbolizing outstation travel across Maharashtra.
 * 4. Palette: Deep Royal Navy (#0a192f) + Radiant Warm Gold / Amber (#f59e0b, #fbbf24).
 * 5. Full Legal Typography: "KOLHAPUR CAB SERVICE" with live 24/7 status indicator.
 */
export default function BrandLogo({ 
  className = '', 
  variant = 'light', // 'light' (for white/glass nav) or 'dark' (for dark navy footer)
  size = 'md',       // 'sm', 'md', 'lg'
  showTagline = true,
  onClick = null
}) {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl'
  };

  return (
    <div 
      className={`flex items-center gap-3 select-none group ${className}`}
      onClick={onClick}
    >
      {/* Royal Crest Shield Trademark Emblem */}
      <div 
        className={`${iconSizes[size]} relative flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0`}
      >
        <img 
          src="/brand-emblem-128.png" 
          alt="Kolhapur Cab Service Emblem" 
          className="w-full h-full object-contain drop-shadow-sm select-none"
          loading="eager"
        />
      </div>

      {/* Brand Typography: Exact Business Name "KOLHAPUR CAB SERVICE" */}
      <div className="flex flex-col leading-none">
        <div className={`font-extrabold tracking-tight font-heading flex items-center gap-1.5 ${titleSizes[size]}`}>
          <span className={isDark ? 'text-white' : 'text-slate-950'}>
            KOLHAPUR
          </span>
          <span className="text-amber-500 font-black tracking-normal">
            CAB
          </span>
        </div>

        {showTagline && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase ${isDark ? 'text-amber-400/90' : 'text-amber-700'}`}>
              SERVICE
            </span>
            <span className="text-slate-400 text-[10px]">•</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="24/7 Active Fleet" />
              <span className={`text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                24/7 TAXI
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
