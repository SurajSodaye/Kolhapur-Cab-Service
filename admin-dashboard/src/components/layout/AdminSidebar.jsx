import {
  BarChart3, CarFront, ChevronLeft, ClipboardList, LayoutDashboard, LogOut, MapPinned,
  Bell, MessageSquareText, Percent, PhoneCall, Settings, Star, UsersRound, X, BriefcaseBusiness,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

const sections = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { label: 'Bookings', to: '/bookings', icon: ClipboardList },
      { label: 'Vehicles', to: '/vehicles', icon: CarFront },
      { label: 'Drivers', to: '/drivers', icon: UsersRound },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Routes & Fares', to: '/routes', icon: MapPinned },
      { label: 'Services', to: '/services', icon: BriefcaseBusiness },
      { label: 'Enquiries', to: '/enquiries', icon: MessageSquareText },
      { label: 'Callback Requests', to: '/callback-requests', icon: PhoneCall },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { label: 'Reviews', to: '/reviews', icon: Star },
      { label: 'Offers & Promos', to: '/offers', icon: Percent },
      { label: 'Reports', to: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { label: 'Settings', to: '/settings', icon: Settings },
      { label: 'Notifications', to: '/notifications', icon: Bell },
      { label: 'Admin Profile', to: '/profile', icon: UsersRound },
    ],
  },
]

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onClose }) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    setLogoutModalOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark" style={{ background: 'transparent', padding: 0 }}>
            <img
              src={`${import.meta.env.BASE_URL}brand-emblem-128.png`}
              alt="Kolhapur Cab Service Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div className="brand-copy">
            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '-0.2px' }}>
              <span>KOLHAPUR</span>
              <span style={{ color: '#f59e0b', fontWeight: 900 }}>CAB</span>
            </strong>
            <span style={{ color: '#fbbf24', fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px' }}>
              OPERATIONS PORTAL
            </span>
          </div>
          <button className="sidebar-close" type="button" aria-label="Close navigation" onClick={onClose}><X size={19} /></button>
          <button className="collapse-button" type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggle}><ChevronLeft size={17} /></button>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {sections.map((section) => (
            <div className="nav-section" key={section.label}>
              <p className="nav-section-label">{section.label}</p>
              {section.items.map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} title={collapsed ? label : undefined} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
                  <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <span className="support-dot" />
            <div>
              <strong>24/7 Operations Desk</strong>
              <small>Station Rd, Kolhapur</small>
            </div>
          </div>
          <button
            className="nav-link logout-link"
            type="button"
            onClick={() => setLogoutModalOpen(true)}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout confirmation dialog */}
      {logoutModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setLogoutModalOpen(false)}>
          <div
            className="booking-modal"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center' }}>
                <LogOut size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Confirm Sign Out</h3>
                <small style={{ color: '#64748b' }}>Operations Administrator Session</small>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px' }}>
              You are currently logged into the Kolhapur Cab Service Admin Workspace. Are you sure you want to exit your administrative session?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setLogoutModalOpen(false)}
              >
                Stay Logged In
              </button>
              <button
                type="button"
                className="primary-button"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
