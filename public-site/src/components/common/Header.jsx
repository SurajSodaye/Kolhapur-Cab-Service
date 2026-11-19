import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Menu, 
  X, 
  Car, 
  Search, 
  Calendar, 
  ShieldCheck, 
  MessageCircle,
  ChevronRight,
  User,
  LogOut,
  ChevronDown,
  UserPlus,
  LogIn
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { mockSettings } from '../../data/mockContent';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const timerRef = useRef(null);
  const userDropdownRef = useRef(null);

  const { currentCustomer, customerProfile, logout } = useCustomerAuth();

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogoClick = (e) => {
    // Prevent immediate navigation so clicks 1-4 do not trigger route reloads
    e.preventDefault();
    closeMenu();

    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // Start 2-second detection window
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        timerRef.current = null;
        // User clicked fewer than 5 times within 2 seconds: perform normal home navigation
        if (location.pathname !== '/') {
          navigate('/');
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 2000);
    } else if (clickCountRef.current >= 5) {
      // 5 clicks achieved within 2 seconds: cancel normal navigation & open admin login
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      clickCountRef.current = 0;
      window.location.assign('/admin/login');
    }
  };

  // Clean up any pending timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Fleet', path: '/fleet' },
    { name: 'Services', path: '/services' },
    { name: 'Popular Routes', path: '/routes' },
    { name: 'About Us', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    closeMenu();
    await logout();
    navigate('/');
  };

  const displayName = customerProfile?.name || currentCustomer?.displayName || currentCustomer?.email?.split('@')[0] || 'Customer';
  const displayInitials = displayName ? displayName.slice(0, 2).toUpperCase() : 'CU';

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Announcement & Quick Contact Bar */}
      <div className="bg-navy-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Station Road (Opp. CBS), Kolhapur</span>
            </span>
            <span className="hidden md:inline-block text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span>24x7 Cab Dispatch Service</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified Chauffeurs</span>
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-auto text-[11px] sm:text-xs">
            <a 
              href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 text-white hover:text-amber-400 font-semibold transition-colors"
              title="Call 24/7 Kolhapur Cab Dispatch"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{mockSettings.contact.primaryPhone}</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link 
              to="/booking-status" 
              className="flex items-center gap-1 text-slate-300 hover:text-amber-300 font-medium transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Track Booking</span>
            </Link>

            {currentCustomer && (
              <>
                <span className="text-slate-700 hidden sm:inline">|</span>
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors"
                >
                  <Car className="w-3.5 h-3.5 text-amber-400" />
                  <span>My Bookings</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`glass-nav border-b border-slate-200/80 transition-shadow duration-300 ${scrolled ? 'shadow-card' : 'shadow-subtle'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo with 5-click admin shortcut */}
            <Link to="/" onClick={handleLogoClick} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl">
              <BrandLogo variant="light" size="md" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'text-amber-800 bg-amber-50 font-bold shadow-subtle'
                        : 'text-slate-700 hover:text-amber-700 hover:bg-slate-100/80'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Right Action CTAs & Customer Authentication Controls */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Customer Logged In Dropdown */}
              {currentCustomer ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 transition shadow-2xs"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                      {displayInitials}
                    </div>
                    <span className="max-w-[110px] truncate">{displayName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Customer Account
                        </span>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {displayName}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {currentCustomer.email}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/my-bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-amber-800 hover:bg-amber-50/70 transition"
                        >
                          <Car className="w-4 h-4 text-amber-600" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-amber-800 hover:bg-amber-50/70 transition"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>My Profile</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Customer Logged Out Controls */
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition border border-slate-200"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {/* Book Cab Primary CTA */}
              <Link
                to="/booking"
                className="btn-primary"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Book a Cab</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/booking"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm"
              >
                <span>Book Cab</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
            {/* Customer Authentication Bar in Mobile Drawer */}
            {currentCustomer ? (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {displayInitials}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {displayName}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {currentCustomer.email}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-rose-600 hover:bg-rose-100/70 rounded-xl transition shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 rounded-xl border border-slate-200"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 rounded-xl shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Customer links if authenticated */}
            {currentCustomer && (
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 text-xs">
                <Link
                  to="/my-bookings"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-amber-900 bg-amber-100/80 border border-amber-200"
                >
                  <Car className="w-3.5 h-3.5 text-amber-700" />
                  <span>My Bookings</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>My Profile</span>
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname === link.path
                      ? 'bg-amber-50 text-amber-800 font-bold border-l-4 border-amber-500'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2.5">
              <Link
                to="/booking-status"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200"
              >
                <Search className="w-4 h-4 text-amber-600" />
                <span>Track Booking Reference</span>
              </Link>

              <Link
                to="/booking"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-md shadow-amber-500/20"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Instant Cab</span>
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Call Dispatch</span>
                </a>
                <a
                  href={`https://wa.me/${mockSettings.contact.whatsappNumber}?text=Hello%20Kolhapur%20Cab%20Service%2C%20I%20need%20a%20taxi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
