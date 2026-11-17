import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Bell, BellOff, Check, CheckCheck, Circle, Clock3, FilterX, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader.jsx'
import { mockBookings } from '../data/mockBookings.js'
import { mockCallbackRequests } from '../data/mockCallbackRequests.js'
import { mockDrivers } from '../data/mockDrivers.js'
import { mockEnquiries } from '../data/mockEnquiries.js'
import { mockOffers } from '../data/mockOffers.js'
import { mockReviews } from '../data/mockReviews.js'
import { mockVehicles } from '../data/mockVehicles.js'
import { notificationCategories } from '../data/mockNotifications.js'
import { useNotifications } from '../context/NotificationsContext.jsx'

const pageSizes = [10, 20, 50]
const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
const recordsByRoute = {
  '/bookings': mockBookings,
  '/enquiries': mockEnquiries,
  '/callback-requests': mockCallbackRequests,
  '/reviews': mockReviews,
  '/offers': mockOffers,
  '/vehicles': mockVehicles,
  '/drivers': mockDrivers,
}

function getRelatedHref(notification) {
  const records = recordsByRoute[notification.relatedRoute]
  if (!records || !notification.relatedId) return null
  const exists = records.some((record) => record.id === notification.relatedId || record.registration === notification.relatedId)
  return exists ? notification.relatedRoute : null
}

function formatCreatedAt(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : dateFormatter.format(date)
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  return <div className={`panel notification-summary-card notification-summary-${tone}`}>
    <span><Icon size={16} /></span><div><small>{label}</small><strong>{value}</strong></div>
  </div>
}

export default function Notifications() {
  const { notifications, markRead, markUnread, markAllRead, deleteNotification, clearNotifications } = useNotifications()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [readStatus, setReadStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    if (!confirmation) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setConfirmation(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [confirmation])

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const summary = [
    { label: 'Total notifications', value: notifications.length, icon: Bell, tone: 'blue' },
    { label: 'Unread', value: unreadCount, icon: BellOff, tone: 'orange' },
    { label: 'Read', value: notifications.length - unreadCount, icon: Check, tone: 'green' },
    { label: 'High priority', value: notifications.filter((item) => item.priority === 'High').length, icon: AlertCircle, tone: 'red' },
  ]

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return notifications.filter((item) => {
      const matchesSearch = !term || [item.title, item.message, item.category, item.relatedId || ''].some((value) => value.toLowerCase().includes(term))
      const matchesCategory = !category || item.category === category
      const matchesRead = !readStatus || (readStatus === 'unread' ? !item.read : item.read)
      const matchesPriority = !priority || item.priority === priority
      return matchesSearch && matchesCategory && matchesRead && matchesPriority
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [notifications, search, category, readStatus, priority])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleItems = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasFilters = Boolean(search || category || readStatus || priority)

  const updateFilter = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setReadStatus('')
    setPriority('')
    setPage(1)
  }

  const confirmAction = () => {
    if (confirmation?.type === 'delete') deleteNotification(confirmation.id)
    if (confirmation?.type === 'clear') clearNotifications()
    setConfirmation(null)
    setPage(1)
  }

  return <>
    <PageHeader title="Notifications" description="Review fictional admin alerts and manage their local read state.">
      <div className="notifications-header-actions">
        <button type="button" className="secondary-button" disabled={!unreadCount} onClick={markAllRead}><CheckCheck size={14} />Mark all as read</button>
        <button type="button" className="secondary-button notifications-clear-button" disabled={!notifications.length} onClick={() => setConfirmation({ type: 'clear' })}><Trash2 size={14} />Clear all</button>
      </div>
    </PageHeader>
    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Demo notifications</strong> — these fictional alerts and read states exist only in local app memory. No real-time, push, email, or SMS delivery is connected.</span></div>

    <section className="notification-summary-grid" aria-label="Notification summary">
      {summary.map((item) => <SummaryCard key={item.label} {...item} />)}
    </section>

    <section className="panel notification-toolbar" aria-label="Notification filters">
      <label className="notification-search"><span>Search notifications</span><input type="search" value={search} onChange={updateFilter(setSearch)} placeholder="Title, message, category or record ID" /></label>
      <label><span>Category</span><select value={category} onChange={updateFilter(setCategory)}><option value="">All categories</option>{notificationCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Read status</span><select value={readStatus} onChange={updateFilter(setReadStatus)}><option value="">All notifications</option><option value="unread">Unread</option><option value="read">Read</option></select></label>
      <label><span>Priority</span><select value={priority} onChange={updateFilter(setPriority)}><option value="">All priorities</option><option>High</option><option>Normal</option><option>Low</option></select></label>
      <button type="button" className="secondary-button notification-filter-clear" disabled={!hasFilters} onClick={clearFilters}><FilterX size={14} />Clear filters</button>
    </section>

    <section className="panel notifications-list-panel">
      <div className="notifications-list-heading"><div><h2>All notifications</h2><p>{filtered.length} {filtered.length === 1 ? 'notification' : 'notifications'}{hasFilters ? ' match your filters' : ''}</p></div><span className="notifications-state-note"><i />Unread alerts are highlighted</span></div>
      {visibleItems.length ? <div className="notifications-list">
        {visibleItems.map((item) => {
          const relatedHref = getRelatedHref(item)
          return <article className={`notification-card${item.read ? '' : ' notification-card-unread'}`} key={item.id}>
            <span className={`notification-category-icon notification-category-${item.category.toLowerCase()}`}><Bell size={16} /></span>
            <div className="notification-card-content">
              <div className="notification-title-row"><h3>{item.title}</h3>{!item.read && <span className="notification-unread-label"><i />Unread</span>}</div>
              <p>{item.message}</p>
              <div className="notification-meta"><span className={`notification-category-pill category-${item.category.toLowerCase()}`}>{item.category}</span><span className={`notification-priority priority-${item.priority.toLowerCase()}`}>{item.priority} priority</span>
                {item.relatedId && <span className="notification-related">Record: {relatedHref ? <Link to={relatedHref}>{item.relatedId}</Link> : <span aria-label="Related record unavailable">{item.relatedId} · unavailable</span>}</span>}
                <span className="notification-timestamp"><Clock3 size={12} />{formatCreatedAt(item.createdAt)}</span>
              </div>
            </div>
            <div className="notification-actions">
              <button type="button" className="secondary-button" aria-label={`${item.read ? 'Mark unread' : 'Mark read'}: ${item.title}`} onClick={() => item.read ? markUnread(item.id) : markRead(item.id)}>
                {item.read ? <><Circle size={13} />Mark unread</> : <><Check size={13} />Mark read</>}
              </button>
              <button type="button" className="icon-button notification-delete" aria-label={`Delete ${item.title}`} onClick={() => setConfirmation({ type: 'delete', id: item.id, title: item.title })}><Trash2 size={15} /></button>
            </div>
          </article>
        })}
      </div> : <div className="notifications-empty"><span><BellOff size={21} /></span><h3>{notifications.length ? 'No matching notifications' : 'No notifications'}</h3><p>{notifications.length ? 'Try adjusting your search or filters to find another alert.' : 'The local demo notification list is empty.'}</p>{hasFilters && <button type="button" className="secondary-button" onClick={clearFilters}>Clear filters</button>}</div>}
      {filtered.length > 0 && <div className="notifications-pagination">
        <span>Showing {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
        <label>Rows per page<select aria-label="Notifications page size" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{[...pageSizes].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <div><button type="button" className="secondary-button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" className="secondary-button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</button></div>
      </div>}
    </section>

    <p className="notifications-preference-note">Settings notification preferences are separate local demo settings and are not connected to this static sample list.</p>

    {confirmation && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmation(null) }}>
      <div className="notification-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="notification-confirm-title" aria-describedby="notification-confirm-copy">
        <div className="modal-header"><div><p className="eyebrow">{confirmation.type === 'clear' ? 'CLEAR DEMO ALERTS' : 'DELETE DEMO ALERT'}</p><h2 id="notification-confirm-title">{confirmation.type === 'clear' ? 'Clear all notifications?' : 'Delete notification?'}</h2></div>
          <button type="button" className="modal-close" aria-label="Close dialog" onClick={() => setConfirmation(null)}>×</button>
        </div>
        <p id="notification-confirm-copy">{confirmation.type === 'clear' ? 'This removes all fictional notifications from the current app session.' : `“${confirmation.title}” will be removed from the current app session.`}</p>
        <div className="notification-confirm-actions"><button type="button" className="secondary-button" onClick={() => setConfirmation(null)}>Cancel</button><button type="button" className="primary-button destructive-confirm-button" onClick={confirmAction}><Trash2 size={14} />{confirmation.type === 'clear' ? 'Clear all' : 'Delete notification'}</button></div>
      </div>
    </div>}
  </>
}
