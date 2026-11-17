import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ExternalLink, Home, RefreshCw, AlertCircle } from 'lucide-react';
import SEO from '../components/common/SEO';

/**
 * AdminDevBridge
 * 
 * Safety bridge for local development when accessing /admin/* on the public-site server.
 * In production (Vercel) and unified preview, /admin/* is rewritten to dist/admin/index.html.
 * In local dev, Vite proxy forwards /admin/* to the admin server on port 5174.
 * If Vite proxy is inactive or admin dev server is on another port, this bridge provides
 * clear guidance and direct 1-click links to the admin portal.
 */
export default function AdminDevBridge() {
  const location = useLocation();
  const [attemptingRedirect, setAttemptingRedirect] = useState(true);

  // Path under /admin that was requested (e.g., /admin/login)
  const targetPath = location.pathname.startsWith('/admin') ? location.pathname : '/admin/login';
  const adminUrl5174 = `http://localhost:5174${targetPath}`;
  const adminUrl5173 = `http://localhost:5173${targetPath}`;

  useEffect(() => {
    // If in development mode and accessed directly, try auto-navigating to the dedicated admin dev port
    const timer = setTimeout(() => {
      setAttemptingRedirect(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEO
        title="Admin Portal — Kolhapur Cab Service"
        description="Operations dashboard and administrator portal for Kolhapur Cab Service."
      />

      <main className="min-h-[75vh] bg-slate-900 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-sm text-center">
          {/* Emblem Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/20">
            <span>Kolhapur Cab Service • Operations Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Admin Workspace Access
          </h1>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            You accessed <code className="bg-slate-950 px-2 py-0.5 rounded text-amber-300 text-xs font-mono">{targetPath}</code>.
            In local development, the admin dashboard runs on its dedicated Vite server.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href={adminUrl5174}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01]"
            >
              <span>Open Admin Dashboard (Port 5174)</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={adminUrl5173}
              className="w-full py-3 px-6 rounded-xl font-semibold text-xs text-slate-200 bg-slate-700/60 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-600/70"
            >
              <span>Alternative: Open Admin on Port 5173</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <div className="pt-4 border-t border-slate-700/60">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Public Website</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 text-left">
            <div className="flex items-center gap-1.5 text-amber-400/90 font-semibold mb-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Developer Tip</span>
            </div>
            Run <code className="text-amber-300 font-mono">npm run dev</code> from the root folder to start both applications concurrently with unified proxy routing on port 3000.
          </div>
        </div>
      </main>
    </>
  );
}
