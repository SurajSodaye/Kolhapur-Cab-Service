# Kolhapur Cab Service (KCS)

A modern, full-stack cab booking and operations management web platform designed for local, outstation, airport, and round-trip taxi services in and around Kolhapur, Maharashtra.

The repository hosts two decoupled React applications connecting to a shared Firebase Cloud Firestore backend:
1. **`public-site/`**: Customer-facing web portal for booking cabs, checking transparent fare estimates, tracking live ride status with secure tokens, and submitting enquiries or feedback.
2. **`admin-dashboard/`**: Operations and fleet management portal for dispatchers and administrators to monitor bookings in real time, assign drivers and vehicles, moderate customer reviews, manage routes, and update business settings.

---

## 🚖 Technology Stack

### Customer Portal (`public-site/`)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Backend Services:** Firebase Modular SDK v13 (Authentication & Cloud Firestore)

### Operations Dashboard (`admin-dashboard/`)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Data Visualizations:** Recharts
- **Backend Services:** Firebase Modular SDK v13 (Authentication & Cloud Firestore real-time listeners)

### Backend & Cloud Infrastructure
- **Firebase Authentication:** Secure Email/Password administrator authentication
- **Cloud Firestore:** Real-time NoSQL database with granular security rules
- **Security Rules:** Role-based access control protecting customer PII and operational records

---

## 📁 Repository Structure

```
Cab-Service/
├── public-site/                 # Customer-facing website
│   ├── src/
│   │   ├── components/          # Reusable UI, booking wizard, header, footer
│   │   ├── pages/               # Home, Booking, BookingStatus, Fleet, Routes, Contact
│   │   ├── services/            # Firestore booking, content, and vehicle services
│   │   └── firebase/            # Firebase SDK client initialization
│   ├── public/                  # Static assets and emblems
│   ├── .env.example             # Template for public site Firebase config
│   ├── package.json
│   └── vite.config.js
│
├── admin-dashboard/             # Business owner & dispatcher portal
│   ├── src/
│   │   ├── components/          # Layout, sidebar, navbar, tables, auth guards
│   │   ├── context/             # AuthContext (Firestore-first), NotificationsContext
│   │   ├── pages/               # Dashboard, Bookings, Enquiries, Drivers, Vehicles, etc.
│   │   ├── services/            # Firestore admin real-time sync service
│   │   └── firebase/            # Firebase SDK client initialization
│   ├── public/                  # Admin emblems and brand assets
│   ├── .env.example             # Template for admin dashboard Firebase config
│   ├── package.json
│   └── vite.config.js
│
├── scripts/                     # Safe administrative tools & documentation
│   ├── set-admin-claim.mjs      # Optional/historical custom claims helper
│   ├── package.json             # Isolated script dependencies
│   └── README.md                # Admin setup guide
│
├── firestore.rules              # Cloud Firestore security rules
├── .gitignore                   # Global git exclusion rules for credentials & builds
└── README.md                    # Project documentation
```

---

## ⚙️ Environment Configuration

Both applications connect to the same Firebase project. Never commit `.env.local` files containing actual API keys or credentials to version control.

### 1. Configure `public-site`
Copy the environment template:
```bash
cd public-site
cp .env.example .env.local
```
Fill in your Firebase web app configuration:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 2. Configure `admin-dashboard`
Copy the environment template:
```bash
cd ../admin-dashboard
cp .env.example .env.local
```
Use the same Firebase project configuration:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## 🔐 Admin Authorization Architecture

The admin dashboard uses the Cloud Firestore **`admins` collection as the Single Source of Truth** for role-based authorization:

1. **Authentication:** The admin logs in using their email and password through Firebase Authentication.
2. **Authorization Verification:** Upon authentication, the dashboard reads:
   ```
   admins/{authenticatedUser.uid}
   ```
3. **Access Criteria:** Access to all operations modules is granted if and only if:
   - The document exists in `/admins/{uid}`.
   - `role === "admin"` (or `"superadmin"`).
   - `active === true`.
4. **Security Rules (`firestore.rules`):**
   - Authenticated users may read **only their own** `admins/{uid}` document.
   - Users cannot create, update, or delete their own admin record (preventing privilege self-escalation).
   - Operational collections (`bookings`, `drivers`, `enquiries`, `reports`, etc.) are locked down strictly to verified administrators.

### Granting Admin Access to an Account:
In the [Firebase Console](https://console.firebase.google.com/):
1. Navigate to **Authentication** > **Users** and copy the admin user's **User UID**.
2. Navigate to **Firestore Database** > **Data**.
3. Create a document in collection `admins`:
   - **Document ID:** `<USER_UID>`
   - **Fields:**
     - `email`: `"admin@example.com"` (string)
     - `role`: `"admin"` (string)
     - `active`: `true` (boolean)

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Running the Public Customer Site
```bash
# Navigate to public site directory
cd public-site

# Install dependencies
npm install

# Start Vite local development server
npm run dev
```
The public portal will be live at `http://localhost:5173`.

### Running the Operations Admin Dashboard
Open a separate terminal:
```bash
# Navigate to admin dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Start Vite local development server
npm run dev
```
The admin dashboard will be live at `http://localhost:5174` (or the next available port).

---

## 🛡️ Building for Production

To test production builds for both applications:

```bash
# Build public website
npm --prefix public-site run build

# Build admin dashboard
npm --prefix admin-dashboard run build
```

Both build outputs will be placed in their respective `dist/` directories, which are excluded from version control.

---

## 📜 License
Private & Proprietary. Developed for Kolhapur Cab Service.
