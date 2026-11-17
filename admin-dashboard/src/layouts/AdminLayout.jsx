import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../components/layout/AdminSidebar.jsx'
import AdminNavbar from '../components/layout/AdminNavbar.jsx'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const location = useLocation()

  return (
    <div className={`app-shell ${collapsed ? 'app-shell-collapsed' : ''}`}>
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="app-main">
        <AdminNavbar
          onMenuClick={() => window.matchMedia('(max-width: 760px)').matches ? setMobileOpen(true) : setCollapsed((value) => !value)}
          searchValue={searchValue}
          onSearch={setSearchValue}
        />
        <main className="main-content" key={location.pathname}>
          <Outlet context={{ searchValue, clearSearch: () => setSearchValue('') }} />
        </main>
      </div>
    </div>
  )
}
