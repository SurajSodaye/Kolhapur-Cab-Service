import React from 'react';
import { MessageCircle } from 'lucide-react';
import { mockSettings } from '../../data/mockContent';

export default function WhatsAppFloat() {
  const whatsappUrl = `https://wa.me/${mockSettings.contact.whatsappNumber}?text=Hello%20Kolhapur%20Cab%20Service%2C%20I%20would%20like%20to%20enquire%20about%20booking%20a%20cab.`;

  return (
    <aside aria-label="Quick WhatsApp assistance" className="fixed bottom-6 right-5 sm:right-6 z-40 flex items-center group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-premium hover:shadow-emerald-600/30 transition-all duration-300 transform group-hover:scale-105"
        aria-label="Chat with Kolhapur Cab Service on WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline-block font-bold text-xs tracking-wide">
          WhatsApp Us
        </span>
      </a>
      <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600 border border-white"></span>
      </span>
    </aside>
  );
}
