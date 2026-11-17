import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarDays, Check, ChevronDown, RefreshCw } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import { BookingOverviewChart, BookingStatusChart, RevenueOverviewChart } from '../components/dashboard/DashboardChart.jsx'
import RecentBookingsTable from '../components/dashboard/RecentBookingsTable.jsx'
import RecentEnquiries from '../components/dashboard/RecentEnquiries.jsx'
import VehicleAvailability from '../components/dashboard/VehicleAvailability.jsx'
import { stats as defaultStats } from '../mock/dashboard.js'
import {
  subscribeBookings,
  subscribeEnquiries,
  subscribeCallbackRequests,
} from '../services/adminFirestoreService.js'

const dateRanges = ['Today', 'This Week', 'This Month']

export default function Dashboard() {
  const { searchValue, clearSearch } = useOutletContext()
  const [range, setRange] = useState('This Week')
  const [refreshing, setRefreshing] = useState(false)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  const [liveBookings, setLiveBookings] = useState([])
  const [liveEnquiries, setLiveEnquiries] = useState([])
  const [liveCallbacks, setLiveCallbacks] = useState([])

  // Subscribe to real-time collections for live dashboard metrics
  useEffect(() => {
    const unsubBookings = subscribeBookings((data) => setLiveBookings(data || []))
    const unsubEnquiries = subscribeEnquiries((data) => setLiveEnquiries(data || []))
    const unsubCallbacks = subscribeCallbackRequests((data) => setLiveCallbacks(data || []))

    return () => {
      unsubBookings()
      unsubEnquiries()
      unsubCallbacks()
    }
  }, [])

  const computedStats = useMemo(() => {
    if (!liveBookings.length && !liveEnquiries.length && !liveCallbacks.length) {
      return defaultStats
    }

    const total = liveBookings.length
    const pending = liveBookings.filter((b) => b.status === 'PENDING').length
    const confirmed = liveBookings.filter((b) => ['CONFIRMED', 'DRIVER_ASSIGNED'].includes(b.status)).length
    const completed = liveBookings.filter((b) => b.status === 'COMPLETED').length
    const newEnquiries = liveEnquiries.filter((e) => e.status === 'New').length
    const newCallbacks = liveCallbacks.filter((c) => c.status === 'New').length

    return [
      { label: 'Total Bookings', value: String(total), change: 'Live Firestore', trend: 'neutral', icon: 'bookings', note: 'total records' },
      { label: 'Pending Review', value: String(pending), change: `${pending} need review`, trend: 'up', icon: 'pending', note: 'awaiting action' },
      { label: 'Confirmed & Assigned', value: String(confirmed), change: 'Active fleet', trend: 'up', icon: 'confirmed', note: 'confirmed trips' },
      { label: 'Completed Trips', value: String(completed), change: 'Fulfilled', trend: 'up', icon: 'completed', note: 'completed rides' },
      { label: 'Customer Enquiries', value: String(liveEnquiries.length), change: `${newEnquiries} new`, trend: 'up', icon: 'enquiries', note: 'via website' },
      { label: 'Callback Requests', value: String(liveCallbacks.length), change: `${newCallbacks} new`, trend: 'up', icon: 'pending', note: 'phone callbacks' },
    ]
  }, [liveBookings, liveEnquiries, liveCallbacks])

  const date = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const refresh = () => {
    setRefreshing(true)
    window.setTimeout(() => {
      setLastUpdated(new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date()))
      setRefreshing(false)
    }, 500)
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back! Here's what's happening with your cab service today.">
        <div className="date-display"><CalendarDays size={16} /><span>{date}</span></div>
        <div className="range-picker-wrap"><button className="secondary-button range-picker" type="button" aria-expanded={rangeOpen} onClick={() => setRangeOpen((open) => !open)}>{range}<ChevronDown size={15} /></button>{rangeOpen && <div className="range-menu">{dateRanges.map((item) => <button key={item} type="button" className={range === item ? 'range-option-selected' : ''} onClick={() => { setRange(item); setRangeOpen(false) }}>{item}{range === item && <Check size={14} />}</button>)}</div>}</div>
        <button className="refresh-button" type="button" disabled={refreshing} onClick={refresh}><RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} /><span>{refreshing ? 'Refreshing' : 'Refresh'}</span></button>
      </PageHeader>
      <div className="demo-banner">
        <span className="demo-banner-mark">i</span>
        <span>
          <strong>Live Operations Desk</strong> — connected to Firebase project <code>cab-service-9ed9e</code>. Real customer bookings, enquiries, and callback requests are tracked in real-time.
        </span>
        {lastUpdated && <small>Updated {lastUpdated}</small>}
      </div>
      <section className="stats-grid" aria-label="Business statistics">{computedStats.map((stat) => <StatCard key={stat.label} stat={stat} />)}</section>
      <section className="charts-grid" aria-label="Business analytics"><BookingOverviewChart /><RevenueOverviewChart /><BookingStatusChart /></section>
      <RecentBookingsTable searchValue={searchValue} data={liveBookings} />
      <div className="lower-grid"><RecentEnquiries data={liveEnquiries} /><VehicleAvailability /></div>
      {searchValue && <button className="search-clear-message" type="button" onClick={clearSearch}>Clear dashboard search: “{searchValue}”</button>}
    </>
  )
}
