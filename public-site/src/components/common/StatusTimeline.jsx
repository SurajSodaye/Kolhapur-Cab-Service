import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Car, CheckCheck, XCircle } from 'lucide-react';

const steps = [
  { key: 'PENDING', label: 'Request Placed', icon: Clock, desc: 'Awaiting admin review' },
  { key: 'UNDER_REVIEW', label: 'Under Review', icon: Clock, desc: 'Checking cab availability' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: ShieldCheck, desc: 'Fare & schedule locked' },
  { key: 'DRIVER_ASSIGNED', label: 'Driver Assigned', icon: Car, desc: 'Chauffeur details sent' },
  { key: 'COMPLETED', label: 'Trip Completed', icon: CheckCheck, desc: 'Safely arrived' },
];

const statusOrder = {
  PENDING: 1,
  UNDER_REVIEW: 2,
  QUOTED: 2,
  CONFIRMED: 3,
  DRIVER_ASSIGNED: 4,
  COMPLETED: 5,
  CANCELLED: -1,
  REJECTED: -1,
};

export default function StatusTimeline({ currentStatus = 'PENDING' }) {
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';
  const currentStepNum = statusOrder[currentStatus] || 1;

  if (isCancelled) {
    return (
      <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 text-center">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2.5 text-rose-600">
          <XCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-rose-900 font-heading">
          Booking {currentStatus === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
        </h4>
        <p className="text-xs sm:text-sm text-rose-700 mt-1 max-w-md mx-auto">
          This booking request has been marked as {currentStatus.toLowerCase()}. Please contact our 24x7 Kolhapur dispatch desk if you have any questions or wish to create a new reservation.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      {/* Desktop & Tablet Progress Bar */}
      <div className="relative">
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0 hidden sm:block rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(100, Math.max(0, ((currentStepNum - 1) / (steps.length - 1)) * 100))}%` 
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStepNum;
            const isCurrent = stepNum === currentStepNum;
            const Icon = step.icon;

            return (
              <div 
                key={step.key} 
                className={`flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center p-3 sm:p-2 rounded-xl sm:rounded-none transition-all ${
                  isCurrent 
                    ? 'bg-amber-50/90 sm:bg-transparent border border-amber-200/80 sm:border-0' 
                    : 'bg-white/60 sm:bg-transparent'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4 stroke-[2.2]" />}
                </div>

                <div className="flex-1 sm:flex-none">
                  <p className={`text-xs font-bold leading-tight ${
                    isCurrent 
                      ? 'text-amber-900 font-extrabold' 
                      : isCompleted 
                      ? 'text-emerald-900' 
                      : 'text-slate-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                    {step.desc}
                  </p>
                  {isCurrent && (
                    <span className="inline-block sm:hidden text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full mt-1">
                      Active Step
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
