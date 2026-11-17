// Kolhapur Cab Service - Mock Vehicles Fleet
// Future Firebase Collection: 'vehicles'

export const mockVehicles = [
  {
    id: "veh-sedan-dzire",
    name: "Maruti Dzire / Honda Amaze",
    category: "Sedan",
    tagline: "Comfortable, economical & ideal for 1-4 passengers",
    capacity: {
      passengers: 4,
      luggage: 3,
      doors: 4
    },
    pricing: {
      ratePerKm: 12,
      minKmPerDay: 300,
      driverAllowancePerDay: 400,
      nightHalt: 300
    },
    features: [
      "Chilled Dual-Zone AC",
      "Plush Ergonomic Seats",
      "Ample Boot Space for 3 Bags",
      "High-speed Fastag Enabled",
      "USB Mobile Chargers",
      "First Aid Kit & Sanitized"
    ],
    fuelType: "CNG / Petrol",
    acType: "Air Conditioned",
    transmission: "Manual / Automatic",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Suzuki_Dzire_2024_ZXI%2B.jpg",
    imageFallback: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Maruti_Suzuki_Swift_Dzire.jpg",
    altText: "White Maruti Suzuki Dzire compact sedan with spacious boot and dual AC",
    popularFor: "Pune & Mumbai airport drops, Business trips, Daily outstation",
    rating: 4.9,
    tripsCompleted: 1420,
    isAvailable: true,
    badge: "Most Popular"
  },
  {
    id: "veh-suv-ertiga",
    name: "Maruti Ertiga (New Gen)",
    category: "SUV",
    tagline: "Spacious 6-seater comfort for family journeys",
    capacity: {
      passengers: 6,
      luggage: 4,
      doors: 5
    },
    pricing: {
      ratePerKm: 15,
      minKmPerDay: 300,
      driverAllowancePerDay: 400,
      nightHalt: 300
    },
    features: [
      "Roof AC Vents for all rows",
      "Foldable 3rd Row for Extra Luggage",
      "Overhead Rooftop Carrier on request",
      "Smooth Ghat Suspension",
      "Fastag & GPS Navigation",
      "Bottled Water & Tissue Box"
    ],
    fuelType: "CNG / Petrol",
    acType: "Triple Row AC",
    transmission: "Manual",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/23/2022_Maruti_Suzuki_Ertiga_LXi.jpg",
    imageFallback: "https://upload.wikimedia.org/wikipedia/commons/6/6b/2022_Suzuki_Ertiga_GX_Hybrid.jpg",
    altText: "Silver Maruti Suzuki Ertiga 6-seater family MPV with roof AC vents",
    popularFor: "Family trips to Goa, Mahabaleshwar ghats, Temple tours",
    rating: 4.8,
    tripsCompleted: 980,
    isAvailable: true,
    badge: "Family Choice"
  },
  {
    id: "veh-lux-innova",
    name: "Toyota Innova Crysta",
    category: "Luxury SUV",
    tagline: "The gold standard of highway comfort, safety & luxury",
    capacity: {
      passengers: 7,
      luggage: 5,
      doors: 5
    },
    pricing: {
      ratePerKm: 19,
      minKmPerDay: 300,
      driverAllowancePerDay: 500,
      nightHalt: 400
    },
    features: [
      "Captain Reclining Seats",
      "Superior Highway Shock Absorption",
      "Rear Climate Control",
      "Extra Large Luggage Boot",
      "High Safety with 7 Airbags & ABS",
      "Professional Senior Uniformed Chauffeur"
    ],
    fuelType: "Diesel",
    acType: "Automatic Climate Control",
    transmission: "Automatic / Manual",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Toyota_Innova_Crysta_2.4_Z_front_right.jpg",
    imageFallback: "https://upload.wikimedia.org/wikipedia/commons/6/68/Toyota_Innova_Crysta.jpg",
    altText: "Bronze metallic Toyota Innova Crysta 2.4 Z luxury MPV with captain reclining seats",
    popularFor: "Executive travel, VIPs, Long-distance cross-state highway runs",
    rating: 4.95,
    tripsCompleted: 2150,
    isAvailable: true,
    badge: "Executive Premium"
  },
  {
    id: "veh-hatch-swift",
    name: "Maruti Swift / WagonR",
    category: "Hatchback",
    tagline: "Agile, swift and economical for couples & city rides",
    capacity: {
      passengers: 4,
      luggage: 2,
      doors: 4
    },
    pricing: {
      ratePerKm: 10,
      minKmPerDay: 250,
      driverAllowancePerDay: 350,
      nightHalt: 250
    },
    features: [
      "Quick City Cooling AC",
      "Compact for narrow city lanes",
      "Comfortable Seating for 3-4",
      "Fastag Enabled",
      "Punctual Doorstep Pickup"
    ],
    fuelType: "CNG / Petrol",
    acType: "Standard AC",
    transmission: "Manual",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0e/2022_Suzuki_Swift_1.2_GLX_Automatic_in_Pure_White%2C_front_right.jpg",
    imageFallback: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Maruti_Suzuki_Swift_2098.JPG",
    altText: "Pure white Maruti Suzuki Swift compact hatchback for couple and city transit",
    popularFor: "Kolhapur local 8hr/80km, Jyotiba, Panhala & rankala sightseeing",
    rating: 4.7,
    tripsCompleted: 820,
    isAvailable: true,
    badge: "Budget Friendly"
  },
  {
    id: "veh-tempo-17",
    name: "Force Urbania / Traveller (17 Seater)",
    category: "Tempo Traveller",
    tagline: "Luxurious mini-bus travel for big families & pilgrimage groups",
    capacity: {
      passengers: 17,
      luggage: 12,
      doors: 3
    },
    pricing: {
      ratePerKm: 26,
      minKmPerDay: 300,
      driverAllowancePerDay: 600,
      nightHalt: 500
    },
    features: [
      "2x1 Pushback Maharaja Luxury Seats",
      "Roof High-Capacity AC Ducts",
      "LED TV & Hi-Fi Sound System",
      "Spacious Rear Separate Luggage Boot",
      "Ample Legroom & Standing Aisle Space",
      "Ghat-experienced Expert Chauffeurs"
    ],
    fuelType: "Diesel",
    acType: "Full Ducted AC",
    transmission: "Manual",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/43/Force_Traveller_Luxury.jpg",
    imageFallback: "https://upload.wikimedia.org/wikipedia/commons/6/61/Force_Traveller%2C_Leh-Manali_Highway.jpg",
    altText: "White Force Traveller 17-seater luxury mini bus with pushback seats and ducted AC",
    popularFor: "Ashtavinayak tours, Shirdi, Goa wedding parties, corporate outings",
    rating: 4.88,
    tripsCompleted: 640,
    isAvailable: true,
    badge: "Group Travel"
  },
  {
    id: "veh-tempo-26",
    name: "Force Tempo Traveller (26 Seater)",
    category: "Tempo Traveller",
    tagline: "Maximum capacity with individual AC vents & pushback seats",
    capacity: {
      passengers: 26,
      luggage: 18,
      doors: 3
    },
    pricing: {
      ratePerKm: 34,
      minKmPerDay: 350,
      driverAllowancePerDay: 700,
      nightHalt: 600
    },
    features: [
      "Individual Reading Lights & USB Points",
      "Pushback Reclining Seats",
      "Full AC Central Cooling",
      "Rooftop Luggage Carrier & Boot Space",
      "Emergency Exits & Fire Extinguisher",
      "PA System & Mic for Tour Leaders"
    ],
    fuelType: "Diesel",
    acType: "High Velocity AC",
    transmission: "Manual",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/61/Force_Traveller%2C_Leh-Manali_Highway.jpg",
    imageFallback: "https://upload.wikimedia.org/wikipedia/commons/4/43/Force_Traveller_Luxury.jpg",
    altText: "Force Tempo Traveller 26-seater group tour coach with pushback reclining seats",
    popularFor: "Weddings in Kolhapur, Pilgrimage groups, College & Industrial tours",
    rating: 4.82,
    tripsCompleted: 410,
    isAvailable: true,
    badge: "Large Events"
  }
];

