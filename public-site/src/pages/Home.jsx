import React from 'react';
import SEO from '../components/common/SEO';
import HeroSection from '../components/home/HeroSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import FleetPreview from '../components/home/FleetPreview';
import ServicesSection from '../components/home/ServicesSection';
import PopularRoutesSection from '../components/home/PopularRoutesSection';
import HowItWorks from '../components/home/HowItWorks';
import TestimonialsSection from '../components/home/TestimonialsSection';
import FaqSection from '../components/home/FaqSection';
import WhatsAppCtaSection from '../components/home/WhatsAppCtaSection';

export default function Home() {
  return (
    <>
      <SEO
        title="Kolhapur Cab Service — Reliable Outstation & City Taxi"
        description="Book premium AC cabs in Kolhapur for Pune, Mumbai, Goa & Belgaum. Safe, sanitized vehicles, verified local drivers, transparent pricing, and 24x7 dispatch."
      />

      <main>
        {/* 1. Hero Section with Quick Booking Widget */}
        <HeroSection />

        {/* 2. Why Choose Us */}
        <WhyChooseUs />

        {/* 3. Cab Fleet Preview */}
        <FleetPreview />

        {/* 4. Services Overview */}
        <ServicesSection />

        {/* 5. Popular Routes from Kolhapur */}
        <PopularRoutesSection />

        {/* 6. How Booking Works */}
        <HowItWorks />

        {/* 7. Customer Testimonials (Identified Sample Content) */}
        <TestimonialsSection />

        {/* 8. Frequently Asked Questions */}
        <FaqSection limit={6} showFullLink={true} />

        {/* 9. Contact & WhatsApp Call-To-Action Banner */}
        <WhatsAppCtaSection />
      </main>
    </>
  );
}

