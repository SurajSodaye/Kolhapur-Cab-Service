import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200/80',
    primary: 'bg-amber-100/90 text-amber-900 border-amber-300',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    
    // Exact Booking Status Variants
    PENDING: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/20',
    UNDER_REVIEW: 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-400/20',
    QUOTED: 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-1 ring-indigo-400/20',
    CONFIRMED: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/20',
    DRIVER_ASSIGNED: 'bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-400/20',
    COMPLETED: 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-400/20',
    CANCELLED: 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-400/20',
    REJECTED: 'bg-red-50 text-red-800 border-red-300 ring-1 ring-red-400/20',
  };

  const dotColors = {
    PENDING: 'bg-amber-500 animate-pulse',
    UNDER_REVIEW: 'bg-sky-500 animate-pulse',
    QUOTED: 'bg-indigo-500',
    CONFIRMED: 'bg-emerald-500',
    DRIVER_ASSIGNED: 'bg-purple-500',
    COMPLETED: 'bg-teal-500',
    CANCELLED: 'bg-rose-500',
    REJECTED: 'bg-red-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;
  const dotColor = dotColors[variant];

  return (
    <span className={`inline-flex items-center font-bold rounded-full border tracking-wide uppercase transition-colors ${currentVariant} ${currentSize} ${className}`}>
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span>{children}</span>
    </span>
  );
}
