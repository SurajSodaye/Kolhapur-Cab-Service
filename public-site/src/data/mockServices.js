// Kolhapur Cab Service - Mock Services
// Future Firebase Collection: 'services'

export const mockServices = [
  {
    id: "srv-outstation",
    title: "Outstation Cabs",
    shortDescription: "Affordable one-way and round-trip outstation taxi service from Kolhapur to anywhere in Maharashtra, Goa & Karnataka.",
    fullDescription: "Travel comfortably across cities without the stress of driving or catching crowded public transport. Our outstation cabs feature sanitized vehicles, experienced highway drivers, and clear pricing with zero hidden surcharges.",
    icon: "Navigation",
    badge: "Most Requested",
    features: [
      "One-way drops & multi-day round trips",
      "Doorstep pickup & drop anywhere in Kolhapur",
      "No hidden kilometer limits on round trips",
      "Ghat-certified professional drivers",
      "Transparent toll & driver allowance breakdown"
    ],
    popularDestinations: ["Pune", "Mumbai", "Goa", "Belgaum", "Mahabaleshwar", "Ratnagiri"],
    startingPrice: "₹10/km",
    image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80",
    imageFallback: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    altText: "Scenic Maharashtra highway outstation cab journey through lush Western Ghats hills"
  },
  {
    id: "srv-local-hourly",
    title: "Local Hourly Packages",
    shortDescription: "Flexible 4 hr / 40 km, 8 hr / 80 km or 12 hr / 120 km city packages for business, shopping or family outings in Kolhapur.",
    fullDescription: "Need a dedicated car and driver at your disposal while you attend meetings, go shopping for Kolhapuri chappals and saaj jewelry, or visit relatives? Our local hourly packages give you complete freedom.",
    icon: "Clock",
    badge: "Flexible Hire",
    features: [
      "4 hrs / 40 km starting at ₹1,200",
      "8 hrs / 80 km starting at ₹2,100",
      "12 hrs / 120 km starting at ₹2,800",
      "Unlimited stops within package limit",
      "Clean air-conditioned sedans & SUVs"
    ],
    popularDestinations: ["Rajarampuri", "Shahupuri", "MIDC Shiroli & Gokul Shirgaon", "Gandhinagar Market"],
    startingPrice: "₹1,200 / package",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
    imageFallback: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
    altText: "Comfortable air-conditioned cab navigating urban city streets for local hourly packages"
  },
  {
    id: "srv-airport-transfers",
    title: "Airport Transfers",
    shortDescription: "Punctual, guaranteed on-time pickups and drops for Pune, Mumbai, Goa (Mopa/Dabolim), Belgaum and Kolhapur airports.",
    fullDescription: "Catch your flight without anxiety. We track flight delays, coordinate pickups with buffer time, and ensure you arrive relaxed. 24x7 midnight and early-morning dispatch available.",
    icon: "Plane",
    badge: "Punctual Guarantee",
    features: [
      "Dedicated Kolhapur to Pune Airport (PNQ) direct drops",
      "Kolhapur to Mumbai CSMI Airport (T1/T2) highway express",
      "Kolhapur to Goa Mopa (GOX) & Dabolim (GOI) transfers",
      "Belgaum Sambra Airport (IXG) fast drops (1.5 hrs)",
      "Complimentary waiting up to 45 mins for flight delays"
    ],
    popularDestinations: ["Pune Airport (PNQ)", "Mumbai Airport (BOM)", "Goa Mopa (GOX)", "Belgaum Airport (IXG)"],
    startingPrice: "₹1,800 fixed onwards",
    image: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=800&q=80",
    imageFallback: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=800&q=80",
    altText: "Punctual airport taxi transfer service with passenger luggage at terminal curbside"
  },
  {
    id: "srv-pilgrimage-darshan",
    title: "Temple & Heritage Darshan",
    shortDescription: "Specialized spiritual circuits covering Shri Mahalaxmi Temple, Jyotiba, Narsobawadi, Panhala Fort & Ganpatipule.",
    fullDescription: "Kolhapur is a sacred hub of ancient spirituality. Our drivers are respectful, patient with elders, and familiar with temple queue timings, VIP pass counters, and the cleanest vegetarian dining stops.",
    icon: "MapPin",
    badge: "Spiritual Circuit",
    features: [
      "Kolhapur City Darshan: Mahalaxmi, Rankala, New Palace",
      "Holy Triangle: Mahalaxmi - Jyotiba - Narsobawadi Datta Temple",
      "Panhala Fort historical excursion with scenic hill views",
      "Special assistance for senior citizens & kids",
      "Custom multi-day Ashtavinayak & Pandharpur tours"
    ],
    popularDestinations: ["Shri Mahalaxmi Mandir", "Wadi Ratnagiri (Jyotiba)", "Narsobawadi", "Panhala Fort"],
    startingPrice: "₹1,800 / day",
    image: "/routes/kolhapur.jpg",
    imageFallback: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    altText: "Historic Shri Mahalaxmi Ambabai Temple pilgrimage circuit cab in Kolhapur"
  },
  {
    id: "srv-corporate-travel",
    title: "Corporate & Business Fleet",
    shortDescription: "Professional transport solutions for business delegates, MIDC factory visits, and company events with GST invoicing.",
    fullDescription: "Corporate clients in Gokul Shirgaon MIDC, Shiroli MIDC, Kagal Hatkanangale industrial zones, and visiting executives rely on Kolhapur Cab Service for impeccable cars and formal drivers.",
    icon: "Briefcase",
    badge: "Corporate Rates",
    features: [
      "Valid GST invoices & monthly corporate credit billing",
      "Formal English & Hindi speaking chauffeurs",
      "Punctuality guaranteed for crucial meetings",
      "Luxury sedans & SUVs for visiting dignitaries",
      "Fleet availability for corporate seminars and retreats"
    ],
    popularDestinations: ["MIDC Shiroli", "MIDC Gokul Shirgaon", "Five Star MIDC Kagal", "Ichalkaranji"],
    startingPrice: "Custom quote",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    imageFallback: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    altText: "Premium executive sedan and professional chauffeur for corporate business travel"
  },
  {
    id: "srv-wedding-events",
    title: "Weddings & Group Events",
    shortDescription: "Grand guest convoys, bridal luxury cars, and 17/26 seater Tempo Travellers for unforgettable wedding celebrations in Kolhapur.",
    fullDescription: "Ensure your wedding guests and family travel in royal luxury. From decorated bride-and-groom entry sedans to coordinated fleets transporting baraatis across Kolhapur's banquet halls.",
    icon: "Users",
    badge: "Event Special",
    features: [
      "Decorated luxury sedans for bride & groom",
      "Multiple Tempo Travellers (17/26 seater) for guest transit",
      "Dedicated fleet coordinator for wedding schedule management",
      "Airport & railway station guest reception logistics",
      "Attractive package rates for 2 to 3 day ceremonies"
    ],
    popularDestinations: ["Kolhapur Lawns & Resorts", "Panhala Hill Resorts", "Heritage Palaces"],
    startingPrice: "Package on request",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    imageFallback: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    altText: "Elegant decorated luxury car convoy for grand weddings and celebratory events"
  }
];

