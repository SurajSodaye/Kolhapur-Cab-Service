# Kolhapur Cab Service — Public Website

A modern, responsive, frontend-first cab booking website for **Kolhapur Cab Service (KCS)** operating in Kolhapur, Maharashtra, India.

## 🚀 Key Features

- **Kolhapur-Centric Branding**: Highlighting local landmark travel (Shri Ambabai Mahalaxmi Temple, Panhala Fort, Jyotiba Hills, Rankala Lake) and highway express routes (Pune, Mumbai, Goa via Amboli Ghat, Belgaum).
- **Frontend-First Architecture**: Built entirely with decoupled mock data and service abstraction layers (`bookingService`, `vehicleService`, `contentService`), ready for seamless future Firebase Firestore integration without touching UI components.
- **Shared Data Contract Schema**: Adheres to the shared admin/public Firestore collection structure (`bookings`, `vehicles`, `drivers`, `routes`, `services`, `enquiries`, `reviews`, `offers`, `settings`).
- **Exact Booking Status Lifecycle**:
  - `PENDING`
  - `UNDER_REVIEW`
  - `QUOTED`
  - `CONFIRMED`
  - `DRIVER_ASSIGNED`
  - `COMPLETED`
  - `CANCELLED`
  - `REJECTED`
- **Booking Flow with Safety Notice**: Generates mock booking reference (e.g. `KCS-2026-XXXXX`), places the request in `PENDING` status, and clearly informs users that dispatch review and confirmation is required before vehicle allocation is final.
- **Interactive Booking Tracker**: Allows tracking status by reference ID or registered 10-digit mobile number, with an interactive testing switcher to simulate all status transitions in real time.
- **Full 12 Required Pages**:
  1. `Home` (`/`)
  2. `About Us` (`/about`)
  3. `Fleet / Our Cabs` (`/fleet`)
  4. `Services` (`/services`)
  5. `Popular Routes` (`/routes`)
  6. `Booking Form` (`/booking`)
  7. `Booking Status & Tracking` (`/booking-status`, `/booking-status/:id`)
  8. `Contact Us & Inquiries` (`/contact`)
  9. `FAQ & Travel Guidance` (`/faq`)
  10. `Privacy Policy` (`/privacy-policy`)
  11. `Terms and Conditions` (`/terms`)
  12. `404 Not Found` (`*`)

## 🛠 Technology Stack

- **React 18**
- **Vite 6**
- **Tailwind CSS 3**
- **React Router DOM 6**
- **Lucide React** (Icons)

## 📁 Project Structure

```
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx            # Status & category pills
│   │   │   ├── Footer.jsx           # Global Kolhapur footer & office details
│   │   │   ├── Header.jsx           # Responsive header with mobile drawer
│   │   │   ├── SEO.jsx              # Dynamic page title & meta descriptions
│   │   │   ├── StatusTimeline.jsx   # 5-step interactive progress visualizer
│   │   │   └── WhatsAppFloat.jsx    # Floating WhatsApp quick chat
│   │   ├── home/
│   │   │   ├── FaqSection.jsx
│   │   │   ├── FleetPreview.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── PopularRoutesSection.jsx
│   │   │   ├── QuickBookingCard.jsx
│   │   │   ├── ServicesSection.jsx
│   │   │   ├── TestimonialsSection.jsx
│   │   │   ├── WhatsAppCtaSection.jsx
│   │   │   └── WhyChooseUs.jsx
│   │   └── booking/
│   │       └── BookingForm.jsx      # Validated booking form & pending receipt
│   ├── data/
│   │   ├── mockBookings.js          # Pre-seeded test bookings
│   │   ├── mockContent.js           # Offers, settings, pickup/drop lists
│   │   ├── mockReviews.js           # Customer testimonials
│   │   ├── mockRoutes.js            # Outstation routes & fare breakdowns
│   │   ├── mockServices.js          # Service categories & packages
│   │   └── mockVehicles.js          # 6 vehicle models & specs
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Booking.jsx
│   │   ├── BookingStatus.jsx
│   │   ├── Contact.jsx
│   │   ├── Faq.jsx
│   │   ├── Fleet.jsx
│   │   ├── Home.jsx
│   │   ├── NotFound.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── Routes.jsx
│   │   ├── Services.jsx
│   │   └── Terms.jsx
│   ├── services/
│   │   ├── bookingService.js        # createBooking, getBookingStatus, updateMockBookingStatus
│   │   ├── contentService.js        # getRoutes, getServices, getReviews, getOffers, createEnquiry
│   │   └── vehicleService.js        # getVehicles, getVehicleById, getFeaturedVehicles
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── test_verification.mjs
```

## ⚡ Running the Project

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start development server**:
   ```bash
   npm run dev
   ```
3. **Run data contract tests**:
   ```bash
   npm test
   ```
4. **Build for production**:
   ```bash
   npm run build
   ```

