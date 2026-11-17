import { Bell, Check, ChevronDown, Menu, Search, Settings, UserRound, X, LogOut, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { profileDefaults } from '../../data/profileDefaults.js'

const pageNames = {
  dashboard: 'Dashboard',
  bookings: 'Bookings Management',
  vehicles: 'Vehicle Fleet',
  drivers: 'Driver Roster',
  routes: 'Routes & Fares',
  services: 'Services Management',
  enquiries: 'Customer Enquiries',
  'callback-requests': 'Callback Requests',
  reviews: 'Customer Reviews',
  offers: 'Offers & Promotions',
  reports: 'Reports & Analytics',
  settings: 'Business Settings',
  profile: 'Admin Profile',
  notifications: 'Notifications',
}

export default function AdminNavbar({ onMenuClick, searchValue, onSearch }) {
  const [menu, setMenu] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const notificationsRef = useRef(null)
  const profileRef = useRef(null)
  const { notifications, unreadCount, markRead } = useNotifications()
  const { currentUser, logout } = useAuth()
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
  const page = pageNames[location.pathname.split('/')[1]] || 'Dashboard'
  const toggleMenu = (name) => setMenu((current) => current === name ? '' : name)

  // Close open dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!menu) return

    const handlePointerDown = (event) => {
      if (menu === 'profile' && profileRef.current && !profileRef.current.contains(event.target)) {
        setMenu('')
      } else if (menu === 'notifications' && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setMenu('')
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenu('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menu])

  const userInitials = (currentUser?.displayName
    ? currentUser.displayName.slice(0, 2)
    : (currentUser?.email ? currentUser.email.slice(0, 2) : 'SP')
  ).toUpperCase()
  const userDisplayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || profileDefaults.fullName
  const userSubtext = currentUser?.email || profileDefaults.jobTitle

  const handleSignOut = async () => {
    setShowSignoutConfirm(false)
    setMenu('')
    try {
      await logout()
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button mobile-menu-button" type="button" aria-label="Open navigation" onClick={onMenuClick}><Menu size={20} /></button>
          <button className="icon-button desktop-menu-button" type="button" aria-label="Toggle sidebar" onClick={onMenuClick}><Menu size={19} /></button>
          <div className="breadcrumb">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} style={{ color: '#f59e0b' }} />
              <span>Operations</span>
            </span>
            <span className="breadcrumb-slash">/</span>
            <strong>{page}</strong>
          </div>
        </div>

        <div className="topbar-right">
          <div className={`top-search ${searchOpen ? 'top-search-open' : ''}`}>
            <Search size={16} />
            <input
              aria-label="Search bookings by ID, customer name or phone"
              placeholder="Search bookings by ID, name or phone..."
              value={searchValue}
              onChange={(event) => onSearch(event.target.value)}
            />
            {searchValue && (
              <button type="button" aria-label="Clear search" onClick={() => onSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="icon-button search-mobile-button"
            aria-label="Show search"
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search size={19} />
          </button>

          {/* Notifications Dropdown */}
          <div className="dropdown-anchor" ref={notificationsRef}>
            <button
              className="icon-button notification-button"
              type="button"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={menu === 'notifications'}
              onClick={() => toggleMenu('notifications')}
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="notification-badge" style={{ background: '#f59e0b' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {menu === 'notifications' && (
              <div className="dropdown-panel notification-panel">
                <div className="dropdown-heading">
                  <strong>Notifications</strong>
                  <span>{unreadCount} unread</span>
                </div>
                <div className="notification-dropdown-list">
                  {recentNotifications.length ? (
                    recentNotifications.map((item) => (
                      <div className={`notification-item${item.read ? '' : ' notification-item-unread'}`} key={item.id}>
                        <span className={`notification-dot ${item.read ? 'notification-read-dot' : 'blue-dot'}`} style={{ background: item.read ? '#cbd5e1' : '#f59e0b' }} />
                        <button
                          type="button"
                          className="notification-dropdown-copy"
                          onClick={() => {
                            markRead(item.id)
                            navigate('/notifications')
                            setMenu('')
                          }}
                        >
                          <strong>{item.title}</strong>
                          <small>{item.relatedId ? `${item.relatedId} · ` : ''}{new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                        </button>
                        {!item.read && (
                          <button
                            type="button"
                            className="notification-dropdown-mark"
                            aria-label={`Mark read: ${item.title}`}
                            onClick={() => markRead(item.id)}
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="notification-dropdown-empty">You're all caught up.</div>
                  )}
                </div>
                <Link className="dropdown-footer" to="/notifications" onClick={() => setMenu('')}>
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="dropdown-anchor profile-anchor" ref={profileRef}>
            <button
              className="profile-button"
              type="button"
              aria-expanded={menu === 'profile'}
              onClick={() => toggleMenu('profile')}
            >
              <span className="avatar" style={{ background: '#0a192f', color: '#f59e0b', fontWeight: 700 }}>
                {userInitials}
              </span>
              <span className="profile-copy">
                <strong>{userDisplayName}</strong>
                <small>{userSubtext}</small>
              </span>
              <ChevronDown size={15} />
            </button>
            {menu === 'profile' && (
              <div className="dropdown-panel profile-panel" role="menu" aria-label="Administrator Account Menu">
                <div className="profile-panel-user">
                  <strong>{userDisplayName}</strong>
                  <small>{userSubtext}</small>
                </div>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    navigate('/profile')
                    setMenu('')
                  }}
                >
                  <UserRound size={16} />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    navigate('/settings')
                    setMenu('')
                  }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  role="menuitem"
                  className="profile-signout-btn"
                  onClick={() => {
                    setMenu('')
                    setShowSignoutConfirm(true)
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="mobile-search-popover">
            <Search size={16} />
            <input
              autoFocus
              aria-label="Search bookings by ID or name"
              placeholder="Search bookings..."
              value={searchValue}
              onChange={(event) => onSearch(event.target.value)}
            />
            <button className="icon-button" aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <X size={17} />
            </button>
          </div>
        )}
      </header>

      {/* Sign Out Modal */}
      {showSignoutConfirm && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowSignoutConfirm(false)}>
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
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Confirm Sign Out</h3>
                <small style={{ color: '#64748b' }}>Operations Administrator Session</small>
              </div>
            </div>
            <p style={{ margin: '0 0 20px', color: '#475569', fontSize: '13px', lineHeight: 1.5 }}>
              Are you sure you want to end your session as <strong>{userDisplayName}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" onClick={() => setShowSignoutConfirm(false)}>
                Cancel
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
