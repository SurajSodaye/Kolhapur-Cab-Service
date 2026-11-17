// Kolhapur Cab Service - Mock Offers, Settings & Content
// Future Firebase Collections: 'offers', 'settings', 'enquiries'

export const mockOffers = [
  {
    id: "off-mahalaxmi-special",
    title: "Mahalaxmi Pilgrimage Special",
    code: "DARSHAN10",
    discountPercent: 10,
    maxDiscount: 400,
    description: "Get 10% off on Kolhapur Local Pilgrimage Circuit covering Mahalaxmi Temple, Jyotiba, and Panhala Fort.",
    validUntil: "2026-12-31",
    tag: "Spiritual Tour"
  },
  {
    id: "off-pune-airport",
    title: "Pune Airport Flat Discount",
    code: "PUNEDROP250",
    flatDiscount: 250,
    description: "Flat ₹250 instant fare reduction on all one-way sedan and SUV airport drops to Pune Airport (PNQ).",
    validUntil: "2026-12-31",
    tag: "Airport Express"
  },
  {
    id: "off-goa-roundtrip",
    title: "Goa Weekend Getaway Pack",
    code: "GOAWEEKEND",
    flatDiscount: 500,
    description: "Save ₹500 on all 3-day round trips from Kolhapur to North or South Goa via scenic Amboli Ghat.",
    validUntil: "2026-12-31",
    tag: "Weekend Saver"
  }
];

export const mockSettings = {
  companyName: "Kolhapur Cab Service (KCS)",
  brandTagline: "Kolhapur's Most Trusted & Premium Cab Booking Network",
  contact: {
    primaryPhone: "+91 9529998320",
    phone: "+91 9529998320",
    whatsappNumber: "919529998320",
    whatsappDisplay: "+91 9529998320",
    email: "booking@kolhapurcabservice.com",
    supportEmail: "support@kolhapurcabservice.com",
    officeAddress: "Shop No. 14, Royal Complex, Opposite Central Bus Stand (CBS), Station Road, Kolhapur, Maharashtra 416001",
    googleMapsEmbed: "https://maps.google.com/?q=Kolhapur+Central+Bus+Stand",
    workingHours: "24 Hours / 7 Days a Week (Dispatch & Booking)"
  },
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com"
  },
  stats: {
    happyRiders: "25,000+",
    kmsTraveled: "1,200,000+",
    activeCabs: "85+",
    customerRating: "4.9/5",
    onTimeRate: "99.4%"
  },
  popularPickupLocations: [
    "Central Bus Stand (CBS) Kolhapur",
    "Chhatrapati Shahu Maharaj Terminus (Kolhapur Railway Station)",
    "Rajarampuri (All Lanes)",
    "Tarabai Park",
    "Shahupuri",
    "Nagala Park",
    "Kawala Naka",
    "Rankala Lake / Shivaji Peth",
    "Gokul Shirgaon MIDC",
    "Shiroli MIDC",
    "Five Star MIDC Kagal",
    "Gandhinagar",
    "Kadamwadi / Star Bazaar Area"
  ],
  popularDropLocations: [
    "Pune (All Localities / Hinjawadi / Viman Nagar)",
    "Pune Airport (PNQ)",
    "Mumbai Airport (CSMI T1 / T2)",
    "Navi Mumbai / Thane / Dadar",
    "Goa (Panaji / Calangute / Mopa Airport GOX)",
    "Belgaum / Belagavi (City & Sambra Airport IXG)",
    "Mahabaleshwar & Panchgani",
    "Ganpatipule Beach & Temple",
    "Shirdi Sai Baba Temple",
    "Narsobawadi Dattatreya Temple",
    "Jyotiba Hills (Wadi Ratnagiri)",
    "Panhala Fort",
    "Bangalore / Hubli",
    "Solapur / Pandharpur"
  ]
};

