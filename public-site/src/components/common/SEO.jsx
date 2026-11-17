import { useEffect } from 'react';

/**
 * Lightweight SEO helper to dynamically update title and meta tags
 */
export default function SEO({ title, description }) {
  useEffect(() => {
    const prevTitle = document.title;
    const baseTitle = "Kolhapur Cab Service";
    
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} — Premium & Reliable Taxi in Kolhapur`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    const prevDescription = metaDesc.getAttribute('content');
    if (description) {
      metaDesc.setAttribute('content', description);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = prevTitle;
      if (prevDescription) metaDesc.setAttribute('content', prevDescription);
    };
  }, [title, description]);

  return null;
}

