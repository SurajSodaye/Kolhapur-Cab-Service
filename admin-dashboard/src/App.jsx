import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Bookings = lazy(() => import('./pages/Bookings.jsx'))
const Vehicles = lazy(() => import('./pages/Vehicles.jsx'))
const Drivers = lazy(() => import('./pages/Drivers.jsx'))
const RoutesPage = lazy(() => import('./pages/Routes.jsx'))
const Services = lazy(() => import('./pages/Services.jsx'))
const Enquiries = lazy(() => import('./pages/Enquiries.jsx'))
const CallbackRequests = lazy(() => import('./pages/CallbackRequests.jsx'))
const Reviews = lazy(() => import('./pages/Reviews.jsx'))
const Offers = lazy(() => import('./pages/Offers.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const AdminProfile = lazy(() => import('./pages/AdminProfile.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))

const modules = [
  { path: 'bookings', title: 'Bookings', description: 'Review and manage customer trip bookings.' },
  { path: 'vehicles', title: 'Vehicles', description: 'Manage your fleet and vehicle availability.' },
  { path: 'drivers', title: 'Drivers', description: 'View and manage your driver roster.' },
  { path: 'routes', title: 'Routes', description: 'Maintain popular destinations and route pricing.' },
  { path: 'services', title: 'Services', description: 'Manage the travel services offered to customers.' },
  { path: 'callback-requests', title: 'Callback Requests', description: 'Follow up with customers who requested a call.' },
  { path: 'offers', title: 'Offers', description: 'Manage promotional offers and discounts.' },
  { path: 'reports', title: 'Reports', description: 'Explore booking and business performance reports.' },
  { path: 'settings', title: 'Settings', description: 'Configure company and dashboard preferences.' },
  { path: 'profile', title: 'Admin Profile', description: 'View your administrator profile.' },
]

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<div className="route-loading" role="status">Loading login...</div>}>
                <Login />
              </Suspense>
            }
          />

          {/* Protected Administrative Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<div className="route-loading" role="status">Loading dashboard...</div>}>
                    <Dashboard />
                  </Suspense>
                }
              />
        <Route
          path="bookings"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading bookings...</div>}>
              <Bookings />
            </Suspense>
          }
        />
        <Route
          path="vehicles"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading vehicles...</div>}>
              <Vehicles />
            </Suspense>
          }
        />
        <Route
          path="drivers"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading drivers...</div>}>
              <Drivers />
            </Suspense>
          }
        />
        <Route
          path="routes"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading routes...</div>}>
              <RoutesPage />
            </Suspense>
          }
        />
        <Route
          path="services"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading services...</div>}>
              <Services />
            </Suspense>
          }
        />
        <Route
          path="enquiries"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading enquiries...</div>}>
              <Enquiries />
            </Suspense>
          }
        />
        <Route
          path="callback-requests"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading callback requests...</div>}>
              <CallbackRequests />
            </Suspense>
          }
        />
        <Route
          path="reviews"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading reviews...</div>}>
              <Reviews />
            </Suspense>
          }
        />
        <Route
          path="offers"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading offers...</div>}>
              <Offers />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading reports...</div>}>
              <Reports />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading settings...</div>}>
              <Settings />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading admin profile...</div>}>
              <AdminProfile />
            </Suspense>
          }
        />
        <Route
          path="notifications"
          element={
            <Suspense fallback={<div className="route-loading" role="status">Loading notifications...</div>}>
              <Notifications />
            </Suspense>
          }
        />
        {modules.filter((module) => !['bookings', 'vehicles', 'drivers', 'routes', 'services', 'enquiries', 'callback-requests', 'reviews', 'offers', 'reports', 'settings', 'profile', 'notifications'].includes(module.path)).map((module) => (
          <Route
            key={module.path}
            path={module.path}
            element={<PlaceholderPage title={module.title} description={module.description} />}
          />
        ))}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </NotificationsProvider>
    </AuthProvider>
  )
}
