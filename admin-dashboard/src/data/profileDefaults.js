// Kolhapur Cab Service - Admin Profile Defaults

export const profileDefaults = {
  fullName: 'Suraj Patil',
  email: 'admin@kolhapurcabservice.com',
  phone: '+91 9529998320',
  bio: 'Operations Administrator & Fleet Controller at Kolhapur Cab Service (KCS). Managing daily outstation bookings, driver allocations, and customer support.',
  city: 'Kolhapur',
  state: 'Maharashtra',
  jobTitle: 'Fleet Operations Lead',
  department: 'Operations & Fleet Dispatch',
  language: 'Marathi, Hindi, English',
  timeZone: 'Asia/Kolkata (IST)',
  landingPage: '/dashboard',
  tablePageSize: '10',
  dateFormat: 'DD MMM YYYY',
  showNotificationPreviews: true,
};

export const profileLandingPages = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/bookings', label: 'Bookings' },
  { value: '/vehicles', label: 'Vehicles' },
  { value: '/drivers', label: 'Drivers' },
  { value: '/routes', label: 'Routes' },
  { value: '/services', label: 'Services' },
  { value: '/enquiries', label: 'Enquiries' },
  { value: '/callback-requests', label: 'Callback Requests' },
  { value: '/reviews', label: 'Reviews' },
  { value: '/offers', label: 'Offers' },
  { value: '/reports', label: 'Reports' },
  { value: '/settings', label: 'Settings' },
];

export const profileDateFormats = ['DD MMM YYYY', 'MMM DD, YYYY', 'YYYY-MM-DD'];

export const profileCompletionFields = [
  'fullName', 'email', 'phone', 'bio', 'city', 'state',
  'jobTitle', 'department', 'language', 'timeZone',
];
