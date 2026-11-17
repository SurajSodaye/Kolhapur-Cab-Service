// Kolhapur Cab Service - Mock Popular Routes
// Future Firebase Collection: 'routes'

export const mockRoutes = [
  {
    id: "route-kolhapur-pune",
    source: "Kolhapur",
    destination: "Pune",
    distanceKm: 235,
    estimatedDuration: "4 hr 15 min",
    startingPrice: 3200,
    roundTripStartingPrice: 5800,
    highway: "NH 48 (Pune-Bangalore Expressway)",
    highlights: [
      "Smooth 6-lane National Highway (NH 48)",
      "Direct drop to Pune Airport (PNQ) & Hinjawadi IT Park",
      "Clean highway food plazas & family rest stops"
    ],
    faresByVehicle: {
      "Hatchback": 3000,
      "Sedan": 3400,
      "SUV": 4500,
      "Luxury SUV": 6200,
      "Tempo Traveller": 8500
    },
    popular: true,
    tag: "Top Commuter Route",
    image: "/routes/pune.jpg",
    imageFallback: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
    altText: "Historic Shaniwar Wada and scenic Pune highway corridor from Kolhapur",
    description: "Daily prompt cab service between Kolhapur and Pune. Doorstep pickup anywhere in Kolhapur city and direct drop to your destination in Pune, Hinjawadi or Pune Airport."
  },
  {
    id: "route-kolhapur-mumbai",
    source: "Kolhapur",
    destination: "Mumbai",
    distanceKm: 385,
    estimatedDuration: "7 hr 00 min",
    startingPrice: 5500,
    roundTripStartingPrice: 9800,
    highway: "NH 48 & Mumbai-Pune Expressway",
    highlights: [
      "Scenic Sahyadri foothills & Mumbai-Pune Expressway",
      "Direct terminal drop at Mumbai Airport (BOM T1/T2)",
      "Experienced chauffeurs trained for Mumbai city traffic"
    ],
    faresByVehicle: {
      "Hatchback": 5200,
      "Sedan": 5800,
      "SUV": 7600,
      "Luxury SUV": 10500,
      "Tempo Traveller": 14000
    },
    popular: true,
    tag: "Capital Highway",
    image: "/routes/mumbai.jpg",
    imageFallback: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80",
    altText: "Iconic Mumbai architectural landmark and coastal expressway from Kolhapur",
    description: "Reliable intercity cab from Kolhapur to South Mumbai, Navi Mumbai, Thane or Chhatrapati Shivaji Maharaj International Airport (T2) with 100% on-time guarantee."
  },
  {
    id: "route-kolhapur-goa",
    source: "Kolhapur",
    destination: "Goa (North / South / Mopa)",
    distanceKm: 215,
    estimatedDuration: "4 hr 30 min",
    startingPrice: 3800,
    roundTripStartingPrice: 7200,
    highway: "Via Nipani - Amboli Ghat or Radhanagari",
    highlights: [
      "Mesmerizing misty Amboli Ghat waterfall pass",
      "Direct drop to Manohar International Airport (GOX / Mopa)",
      "Panaji, Calangute, Baga, Candolim & Madgaon drops"
    ],
    faresByVehicle: {
      "Hatchback": 3600,
      "Sedan": 4100,
      "SUV": 5400,
      "Luxury SUV": 7500,
      "Tempo Traveller": 9900
    },
    popular: true,
    tag: "Vacation Favorite",
    image: "/routes/goa.jpg",
    imageFallback: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    altText: "Tropical Goa coastal scenery and misty Amboli Ghat mountain pass from Kolhapur",
    description: "The quickest, most picturesque gateway from Kolhapur to Goa. We take you through the breathtaking Amboli Ghat straight to your beach resort or Mopa airport without transfer hassles."
  },
  {
    id: "route-kolhapur-belgaum",
    source: "Kolhapur",
    destination: "Belgaum (Belagavi)",
    distanceKm: 110,
    estimatedDuration: "1 hr 50 min",
    startingPrice: 1800,
    roundTripStartingPrice: 3200,
    highway: "NH 48 6-Lane Golden Quadrilateral",
    highlights: [
      "Fast 6-lane Golden Quadrilateral highway corridor",
      "Direct drop to Belgaum Airport (IXG) & city center",
      "Short turnaround for medical, business & university visits"
    ],
    faresByVehicle: {
      "Hatchback": 1700,
      "Sedan": 2000,
      "SUV": 2800,
      "Luxury SUV": 3900,
      "Tempo Traveller": 5200
    },
    popular: true,
    tag: "Quick Corridor",
    image: "/routes/belgaum.jpg",
    imageFallback: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    altText: "Suvarna Vidhana Soudha grand landmark and fast 6-lane highway in Belgaum",
    description: "Rapid intercity transit between Kolhapur and Belgaum across the Maharashtra-Karnataka border. Seamless, fast and cost-effective cab booking."
  },
  {
    id: "route-kolhapur-mahabaleshwar",
    source: "Kolhapur",
    destination: "Mahabaleshwar & Panchgani",
    distanceKm: 180,
    estimatedDuration: "3 hr 45 min",
    startingPrice: 3200,
    roundTripStartingPrice: 6000,
    highway: "NH 48 via Satara & Pasarni / Wai Ghat",
    highlights: [
      "Strawberry farm tours and hill-station sightseeing",
      "Panchgani Table Land & Arthur's Seat viewpoints",
      "Customizable 2-day / 3-day round trip holiday packages"
    ],
    faresByVehicle: {
      "Hatchback": 3000,
      "Sedan": 3400,
      "SUV": 4600,
      "Luxury SUV": 6400,
      "Tempo Traveller": 8600
    },
    popular: false,
    tag: "Hill Station Escapes",
    image: "/routes/mahabaleshwar.jpg",
    imageFallback: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    altText: "Misty Sahyadri mountain pass and lush strawberry farms in Mahabaleshwar",
    description: "Breathe the fresh Sahyadri mountain air. Enjoy an unforgettable hill station excursion from Kolhapur to Panchgani and Mahabaleshwar with experienced mountain drivers."
  },
  {
    id: "route-kolhapur-ganpatipule",
    source: "Kolhapur",
    destination: "Ganpatipule & Ratnagiri",
    distanceKm: 145,
    estimatedDuration: "3 hr 30 min",
    startingPrice: 2800,
    roundTripStartingPrice: 5200,
    highway: "Via Amba Ghat (SH 166)",
    highlights: [
      "Scenic Konkan coast road via lush Amba Ghat",
      "Famous Swayambhu Ganpati temple right on the beach",
      "Fresh Alphonso mango & Konkani seafood food stops"
    ],
    faresByVehicle: {
      "Hatchback": 2600,
      "Sedan": 3000,
      "SUV": 4200,
      "Luxury SUV": 5900,
      "Tempo Traveller": 7900
    },
    popular: true,
    tag: "Konkan Pilgrimage & Beach",
    image: "/routes/ganpatipule.jpg",
    imageFallback: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    altText: "Famous Swayambhu Ganpati temple on the pristine beach of Ganpatipule",
    description: "Travel smoothly from the historical city of Kolhapur down the western ghats to the pristine virgin beaches and holy deity of Ganpatipule."
  },
  {
    id: "route-kolhapur-shirdi",
    source: "Kolhapur",
    destination: "Shirdi Sai Baba Temple",
    distanceKm: 440,
    estimatedDuration: "8 hr 30 min",
    startingPrice: 6800,
    roundTripStartingPrice: 12000,
    highway: "Via Satara, Pune bypass & Ahmednagar / Sangamner",
    highlights: [
      "Comfortable long-distance sacred pilgrimage travel",
      "Early morning Kakad Aarti drop coordination",
      "Optional halts at Shani Shingnapur on request"
    ],
    faresByVehicle: {
      "Hatchback": 6500,
      "Sedan": 7200,
      "SUV": 9500,
      "Luxury SUV": 13000,
      "Tempo Traveller": 16500
    },
    popular: false,
    tag: "Sacred Darshan",
    image: "/routes/shirdi.jpg",
    imageFallback: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    altText: "Sacred golden kalash and spire of Shri Saibaba Sansthan Temple in Shirdi",
    description: "Complete spiritual peace of mind. Dedicated AC cabs from Kolhapur to Shirdi with patient drivers who accommodate senior citizens and VIP darshan timings."
  },
  {
    id: "route-kolhapur-darshan-local",
    source: "Kolhapur City",
    destination: "Kolhapur Darshan (Mahalaxmi - Jyotiba - Panhala)",
    distanceKm: 90,
    estimatedDuration: "Full Day (8-10 hrs)",
    startingPrice: 1800,
    roundTripStartingPrice: 1800,
    highway: "Local Circuit",
    highlights: [
      "Shri Ambabai Mahalaxmi Temple VIP darshan drop",
      "Historical Panhala Fort (Sajja Kothi & Teen Darwaza)",
      "Sacred Jyotiba Hilltop & Rankala Lake sunset stop"
    ],
    faresByVehicle: {
      "Hatchback": 1800,
      "Sedan": 2200,
      "SUV": 3000,
      "Luxury SUV": 4500,
      "Tempo Traveller": 6000
    },
    popular: true,
    tag: "City & Heritage Tour",
    image: "/routes/kolhapur.jpg",
    imageFallback: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    altText: "Historic Shri Ambabai Mahalaxmi Temple and Panhala Fort heritage circuit in Kolhapur",
    description: "The complete cultural & spiritual Kolhapur experience. Visit Shri Mahalaxmi Ambabai Temple, majestic Panhala Fort, Jyotiba Hills and scenic Rankala Lake with a courteous local driver guide."
  }
];
