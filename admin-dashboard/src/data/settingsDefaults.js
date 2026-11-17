// Kolhapur Cab Service - Settings Defaults
// Aligned with Public Website mockSettings (public-site/src/data/mockContent.js)

export const settingsDefaults = {
  businessName: 'Kolhapur Cab Service (KCS)',
  brandTagline: "Kolhapur's Most Trusted & Premium Cab Booking Network",
  businessPhone: '+91 9529998320',
  primaryPhone: '+91 9529998320',
  whatsappNumber: '919529998320',
  whatsappDisplay: '+91 9529998320',
  businessEmail: 'booking@kolhapurcabservice.com',
  supportEmail: 'support@kolhapurcabservice.com',
  businessAddress: 'Shop No. 14, Royal Complex, Opposite Central Bus Stand (CBS), Station Road',
  city: 'Kolhapur',
  state: 'Maharashtra',
  postalCode: '416001',
  businessDescription: '24/7 premium outstation taxi, local hourly rentals, and airport transfer cab network operating from Kolhapur across Maharashtra, Goa, and Karnataka.',
  businessHours: '24 Hours / 7 Days a Week (Dispatch & Booking)',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  bookingPrefix: 'KCS',
  minimumAdvanceMinutes: 30,
  maximumAdvanceDays: 90,
  passengerLimit: 26,
  luggageLimit: 18,
  allowSameDay: true,
  allowReturnBookings: true,
  minimumFare: 1200,
  perKilometreRate: 12,
  driverAllowance: 400,
  waitingCharge: 150,
  nightCharge: 300,
  notifyBookings: true,
  notifyEnquiries: true,
  notifyCallbacks: true,
  notifyReviews: true,
  notifyOffers: true,
  tablePageSize: 10,
  dateFormat: 'DD MMM YYYY',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    twitter: 'https://twitter.com',
  },
  stats: {
    happyRiders: '25,000+',
    kmsTraveled: '1,200,000+',
    activeCabs: '85+',
    customerRating: '4.9/5',
    onTimeRate: '99.4%',
  },
};

export const settingSections = [
  { id: 'general', label: 'General business' },
  { id: 'contact', label: 'Contact & dispatch desk' },
  { id: 'booking', label: 'Booking rules' },
  { id: 'pricing', label: 'Pricing & allowances' },
  { id: 'notifications', label: 'Alerts & notifications' },
  { id: 'display', label: 'System & display' },
];

export const settingWorkingDays = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];
