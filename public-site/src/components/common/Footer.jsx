import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Heart,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { mockSettings } from '../../data/mockContent';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Cab Fleet', path: '/fleet' },
    { name: 'Services & Packages', path: '/services' },
    { name: 'Popular Routes', path: '/routes' },
    { name: 'Book a Taxi', path: '/booking' },
    { name: 'Track Booking Status', path: '/booking-status' },
    { name: 'About Kolhapur Cabs', path: '/about' },
    { name: 'Frequently Asked Questions', path: '/faq' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const popularRoutes = [
    { name: 'Kolhapur to Pune Cab', path: '/routes' },
    { name: 'Kolhapur to Mumbai Airport Taxi', path: '/routes' },
    { name: 'Kolhapur to Goa (Amboli Ghat) Cab', path: '/routes' },
    { name: 'Kolhapur to Belgaum Fast Taxi', path: '/routes' },
    { name: 'Kolhapur to Mahabaleshwar Outstation', path: '/routes' },
    { name: 'Kolhapur to Ganpatipule / Ratnagiri', path: '/routes' },
    { name: 'Kolhapur Mahalaxmi & Jyotiba Darshan', path: '/services' },
    { name: 'Kolhapur to Shirdi Sai Baba Mandir', path: '/routes' },
  ];

  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link to="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl">
              <BrandLogo variant="dark" size="md" />
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              Kolhapur’s premier on-demand and outstation cab booking service. Dedicated to safe, sanitized, punctual, and transparent travel across Maharashtra, Goa, and Karnataka.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Chauffeurs & Fastag Enabled</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>24/7 Midnight & Early Morning Dispatch</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${mockSettings.contact.whatsappNumber}?text=Hello%20Kolhapur%20Cab%20Service%2C%20I%20have%20an%20enquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-heading mb-4">
              Explore & Book
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.path + link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-150"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500/70" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Popular Routes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-heading mb-4">
              Popular Routes
            </h3>
            <ul className="space-y-2 text-sm">
              {popularRoutes.map((route, i) => (
                <li key={i}>
                  <Link
                    to={route.path}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-150"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500/70" />
                    <span>{route.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-heading mb-4">
              Kolhapur Office
            </h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <span className="text-slate-400 leading-snug">
                  {mockSettings.contact.officeAddress}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`}
                  className="text-white hover:text-amber-400 font-semibold transition-colors"
                >
                  {mockSettings.contact.primaryPhone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${mockSettings.contact.email}`}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {mockSettings.contact.email}
                </a>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-400 font-medium">Payment Methods Accepted:</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-300">UPI / QR</span>
                  <span className="px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-300">Google Pay</span>
                  <span className="px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-300">PhonePe</span>
                  <span className="px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-300">NetBanking</span>
                  <span className="px-2 py-0.5 text-[11px] bg-slate-900 border border-slate-800 rounded-lg text-slate-300">Cash to Driver</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {currentYear} Kolhapur Cab Service (KCS). All rights reserved. Operating proudly in Karveer Nagari Kolhapur.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/booking-status" className="hover:text-amber-400 text-amber-400/90 transition-colors font-medium">
              Check Booking Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
