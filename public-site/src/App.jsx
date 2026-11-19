import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Customer Authentication Context & Protected Route
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import CustomerProtectedRoute from './components/auth/CustomerProtectedRoute';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import WhatsAppFloat from './components/common/WhatsAppFloat';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Fleet from './pages/Fleet';
import Services from './pages/Services';
import RoutesPage from './pages/Routes';
import Booking from './pages/Booking';
import BookingStatus from './pages/BookingStatus';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AdminDevBridge from './pages/AdminDevBridge';

// Customer Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <CustomerAuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-amber-500 selection:text-white">
          {/* Responsive Sticky Header with Customer Auth Controls */}
          <Header />

          {/* Dynamic Route Content */}
          <div className="flex-grow">
            <Routes>
              {/* Public Marketing & Content Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/services" element={<Services />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking-status" element={<BookingStatus />} />
              <Route path="/booking-status/:id" element={<BookingStatus />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Customer Authentication & Account Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Customer Protected Routes */}
              <Route
                path="/profile"
                element={
                  <CustomerProtectedRoute>
                    <Profile />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <CustomerProtectedRoute>
                    <MyBookings />
                  </CustomerProtectedRoute>
                }
              />

              {/* Development Admin Bridge & Fallback 404 */}
              <Route path="/admin/*" element={<AdminDevBridge />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          {/* Global Floating WhatsApp Contact Pill */}
          <WhatsAppFloat />

          {/* Comprehensive Kolhapur Footer */}
          <Footer />
        </div>
      </Router>
    </CustomerAuthProvider>
  );
}
