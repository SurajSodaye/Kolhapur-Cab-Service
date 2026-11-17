import { useEffect, useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { ArrowDownToLine, ArrowUpDown, CalendarDays, Printer } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import {
  reportBookings, reportCallbacks, reportDrivers, reportEnquiries, reportVehicles,
} from '../data/mockReports.js'
import {
  subscribeBookings,
  subscribeEnquiries,
  subscribeCallbackRequests,
} from '../services/adminFirestoreService.js'

const presets = ['Today', 'Last 7 days', 'Last 30 days', 'This month', 'Last month', 'Custom range']
const palette = ['#2563eb', '#10a76d', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#ef4444']
const statusColors = {
  Completed: '#10a76d', Confirmed: '#2563eb', Pending: '#f59e0b', 'Driver Assigned': '#8b5cf6',
  'Under Review': '#06b6d4', Quoted: '#64748b', Cancelled: '#ef4444', Rejected: '#991b1b',
  COMPLETED: '#10a76d', CONFIRMED: '#2563eb', PENDING: '#f59e0b', DRIVER_ASSIGNED: '#8b5cf6',
  UNDER_REVIEW: '#06b6d4', QUOTED: '#64748b', CANCELLED: '#ef4444', REJECTED: '#991b1b',
}
const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const number = (value) => Number(value || 0).toLocaleString('en-IN')

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dateFromKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null
}

function parseBookingDate(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const match = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/.exec(value.trim())
  if (!match) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months.findIndex((name) => name.toLowerCase() === match[2].toLowerCase())
  if (month < 0) return ''
  const date = new Date(Number(match[3]), month, Number(match[1]))
  if (date.getFullYear() !== Number(match[3]) || date.getMonth() !== month || date.getDate() !== Number(match[1])) return ''
  return localDateKey(date)
}

function dateKeyFromTimestamp(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : ''
}

function formatDate(value) {
  const date = dateFromKey(value)
  return date
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    : value || '—'
}

function selectedDateRange(preset) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  const start = new Date(today)
  if (preset === 'Last 7 days') start.setDate(start.getDate() - 6)
  else if (preset === 'Last 30 days') start.setDate(start.getDate() - 29)
  else if (preset === 'This month') start.setDate(1)
  else if (preset === 'Last month') {
    start.setDate(1)
    start.setMonth(start.getMonth() - 1)
    end.setDate(0)
  }
  return { from: localDateKey(start), to: localDateKey(end) }
}

function validFare(booking) {
  if (booking.status !== 'Completed' || booking.fare === '' || booking.fare === null || booking.fare === undefined) return null
  const fare = Number(booking.fare)
  return Number.isFinite(fare) && fare > 0 ? fare : null
}

function groupBy(rows, keyOf, amountOf = () => 0) {
  const groups = new Map()
  rows.forEach((row) => {
    const key = keyOf(row) || 'Not recorded'
    const entry = groups.get(key) || { name: key, count: 0, revenue: 0 }
    entry.count += 1
    entry.revenue += amountOf(row)
    groups.set(key, entry)
  })
  return [...groups.values()]
}

function buildTimeline(from, to, bookings) {
  const start = dateFromKey(from)
  const end = dateFromKey(to)
  if (!start || !end || end < start) return { interval: 'day', rows: [] }
  const daySpan = Math.floor((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / 86400000) + 1
  const interval = daySpan <= 45 ? 'day' : 'month'
  const buckets = new Map()
  const cursor = new Date(start)
  if (interval === 'day') {
    while (cursor <= end) {
      const key = localDateKey(cursor)
      buckets.set(key, { key, label: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(cursor), bookings: 0, completed: 0, revenue: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
  } else {
    cursor.setDate(1)
    const last = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cursor <= last) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      buckets.set(key, { key, label: new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' }).format(cursor), bookings: 0, completed: 0, revenue: 0 })
      cursor.setMonth(cursor.getMonth() + 1)
    }
  }
  bookings.forEach((booking) => {
    const key = parseBookingDate(booking.date)
    const bucketKey = interval === 'day' ? key : key.slice(0, 7)
    const bucket = buckets.get(bucketKey)
    if (!bucket) return
    bucket.bookings += 1
    if (booking.status === 'Completed') bucket.completed += 1
    bucket.revenue += validFare(booking) || 0
  })
  return { interval, rows: [...buckets.values()] }
}

export function serializeCsv(rows) {
  return rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
}

function saveCsv(rows, filename) {
  const url = URL.createObjectURL(new Blob([`\uFEFF${serializeCsv(rows)}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function rangeFilename(from, to) {
  return `${from || 'invalid-range'}-to-${to || 'invalid-range'}`
}

function SummaryCard({ label, value, note, tone }) {
  return <div className={`summary-card summary-card-${tone}`}>
    <span className="summary-card-label">{label}</span>
    <strong>{value}</strong>
    {note && <small>{note}</small>}
  </div>
}

function ChartPanel({ title, subtitle, children, className = '' }) {
  return <section className={`panel reports-chart-panel ${className}`}>
    <div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>
    {children}
  </section>
}

function ChartEmpty({ children = 'No records in this date range.' }) {
  return <div className="reports-chart-empty" role="status">{children}</div>
}

function SortHeader({ children, sortKey, state, onSort }) {
  return <th><button type="button" className="reports-sort-button" onClick={() => onSort(sortKey)} aria-label={`Sort by ${children}, ${state.key === sortKey && state.direction === 'asc' ? 'descending' : 'ascending'}`}>
    {children}<ArrowUpDown size={11} />
  </button></th>
}

function DetailTable({ title, description, columns, rows, emptyMessage, state, onSort, className = '' }) {
  const sortedRows = [...rows].sort((a, b) => {
    const first = a[state.key]
    const second = b[state.key]
    const comparison = typeof first === 'number' && typeof second === 'number'
      ? first - second
      : String(first ?? '').localeCompare(String(second ?? ''), 'en', { sensitivity: 'base', numeric: true })
    return state.direction === 'asc' ? comparison : -comparison
  })
  return <section className={`panel reports-table-panel ${className}`}>
    <div className="panel-heading"><div><h2>{title}</h2><p>{description}</p></div></div>
    <div className="table-scroll reports-table-scroll">
      <table className="data-table reports-table">
        <thead><tr>{columns.map((column) => column.sortKey
          ? <SortHeader key={column.key} sortKey={column.sortKey} state={state} onSort={onSort}>{column.label}</SortHeader>
          : <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>{sortedRows.length ? sortedRows.map((row) => <tr key={row.id || row.name}>
          {columns.map((column) => <td key={column.key} className={column.className || ''}>{column.render ? column.render(row[column.key], row) : (row[column.key] ?? '—')}</td>)}
        </tr>) : <tr><td colSpan={columns.length}><div className="reports-table-empty">{emptyMessage}</div></td></tr>}</tbody>
      </table>
    </div>
  </section>
}

const tooltipStyle = { border: '1px solid #e5eaf1', borderRadius: 9, boxShadow: '0 8px 24px rgba(23,36,58,.08)', fontSize: 11 }

export default function Reports() {
  const initialRange = selectedDateRange('Last 30 days')
  const [preset, setPreset] = useState('Last 30 days')
  const [dateFrom, setDateFrom] = useState(initialRange.from)
  const [dateTo, setDateTo] = useState(initialRange.to)
  const [sorts, setSorts] = useState({
    status: { key: 'name', direction: 'asc' },
    trip: { key: 'name', direction: 'asc' },
    vehicle: { key: 'count', direction: 'desc' },
    driver: { key: 'count', direction: 'desc' },
    bookings: { key: 'date', direction: 'asc' },
  })

  const [liveBookings, setLiveBookings] = useState([])
  const [liveEnquiries, setLiveEnquiries] = useState([])
  const [liveCallbacks, setLiveCallbacks] = useState([])

  useEffect(() => {
    const unsubB = subscribeBookings((data) => setLiveBookings(data || []))
    const unsubE = subscribeEnquiries((data) => setLiveEnquiries(data || []))
    const unsubC = subscribeCallbackRequests((data) => setLiveCallbacks(data || []))
    return () => {
      unsubB()
      unsubE()
      unsubC()
    }
  }, [])

  const start = dateFrom ? dateFrom : ''
  const end = dateTo ? dateTo : ''
  const validRange = Boolean(dateFrom && dateTo && dateFrom <= dateTo && dateFromKey(dateFrom) && dateFromKey(dateTo))
  const rangeLabel = validRange ? `${formatDate(start)} – ${formatDate(end)}` : 'Invalid or incomplete date range'

  const activeBookingsSource = liveBookings.length > 0
    ? liveBookings.map((b) => ({
        ...b,
        date: b.pickupDate || b.date,
        fare: b.estimatedFare || b.fare,
        cab: b.vehicleCategory || b.cab,
      }))
    : reportBookings

  const activeEnquiriesSource = liveEnquiries.length > 0 ? liveEnquiries : reportEnquiries
  const activeCallbacksSource = liveCallbacks.length > 0 ? liveCallbacks : reportCallbacks

  const filteredBookings = useMemo(() => validRange
    ? activeBookingsSource.filter((booking) => {
      const key = parseBookingDate(booking.date)
      return key && key >= start && key <= end
    })
    : [], [activeBookingsSource, end, start, validRange])

  const filteredEnquiries = useMemo(() => validRange
    ? activeEnquiriesSource.filter((item) => {
      const key = dateKeyFromTimestamp(item.createdDate)
      return key && key >= start && key <= end
    })
    : [], [activeEnquiriesSource, end, start, validRange])

  const filteredCallbacks = useMemo(() => validRange
    ? activeCallbacksSource.filter((item) => {
      const key = dateKeyFromTimestamp(item.createdDate)
      return key && key >= start && key <= end
    })
    : [], [activeCallbacksSource, end, start, validRange])

  const completedBookings = filteredBookings.filter((booking) => booking.status === 'Completed')
  const cancelledBookings = filteredBookings.filter((booking) => booking.status === 'Cancelled')
  const revenueBookings = filteredBookings.map((booking) => ({ booking, fare: validFare(booking) }))
    .filter((entry) => entry.fare !== null)
  const totalRevenue = revenueBookings.reduce((sum, entry) => sum + entry.fare, 0)
  const averageValue = revenueBookings.length ? totalRevenue / revenueBookings.length : 0
  const completionRate = filteredBookings.length ? completedBookings.length / filteredBookings.length * 100 : 0

  const statusRows = useMemo(() => {
    const groups = groupBy(filteredBookings, (booking) => booking.status, (booking) => validFare(booking) || 0)
    return groups.map((group) => ({
      ...group,
      share: filteredBookings.length ? group.count / filteredBookings.length * 100 : 0,
      id: group.name,
    }))
  }, [filteredBookings])
  const tripRows = useMemo(() => groupBy(filteredBookings, (booking) => booking.tripType, (booking) => validFare(booking) || 0)
    .map((group) => ({ ...group, id: group.name })), [filteredBookings])
  const vehicleRows = useMemo(() => {
    const assignments = groupBy(filteredBookings, (booking) => booking.vehicle || 'Not recorded', (booking) => validFare(booking) || 0)
    const groups = new Map(assignments.map((entry) => [entry.name, entry]))
    return reportVehicles.map((vehicle) => {
      const entry = groups.get(vehicle.id)
      const assigned = filteredBookings.filter((booking) => booking.vehicle === vehicle.id)
      return {
        id: vehicle.id, name: vehicle.id, category: vehicle.type, count: entry?.count || 0,
        completed: assigned.filter((booking) => booking.status === 'Completed').length,
        revenue: assigned.reduce((sum, booking) => sum + (validFare(booking) || 0), 0),
      }
    }).concat([...groups.values()].filter((entry) => !reportVehicles.some((vehicle) => vehicle.id === entry.name))
      .map((entry) => ({
        id: entry.name, name: entry.name, category: 'Not recorded', count: entry.count,
        completed: filteredBookings.filter((booking) => (booking.vehicle || 'Not recorded') === entry.name && booking.status === 'Completed').length,
        revenue: entry.revenue,
      })))
  }, [filteredBookings])
  const driverRows = useMemo(() => reportDrivers.map((name) => {
    const assigned = filteredBookings.filter((booking) => booking.driver === name)
    return {
      id: name, name, count: assigned.length,
      completed: assigned.filter((booking) => booking.status === 'Completed').length,
      revenue: assigned.reduce((sum, booking) => sum + (validFare(booking) || 0), 0),
    }
  }).concat(groupBy(filteredBookings.filter((booking) => !reportDrivers.includes(booking.driver)), (booking) => booking.driver || 'Not recorded', (booking) => validFare(booking) || 0)
    .map((entry) => {
      const assigned = filteredBookings.filter((booking) => (booking.driver || 'Not recorded') === entry.name)
      return {
        id: entry.name, name: entry.name, count: entry.count,
        completed: assigned.filter((booking) => booking.status === 'Completed').length,
        revenue: entry.revenue,
      }
    })), [filteredBookings])
  const paymentRows = useMemo(() => groupBy(filteredBookings, (booking) => booking.paymentStatus)
    .map((entry, index) => ({ ...entry, color: palette[index % palette.length] })), [filteredBookings])
  const cabRows = useMemo(() => groupBy(filteredBookings, (booking) => booking.cab)
    .map((entry, index) => ({ ...entry, color: palette[index % palette.length] })), [filteredBookings])
  const revenueByTrip = tripRows.filter((row) => row.revenue > 0)
  const revenueByCab = groupBy(revenueBookings.map(({ booking, fare }) => ({ ...booking, reportFare: fare })), (booking) => booking.cab, (booking) => booking.reportFare)
  const timeline = useMemo(() => validRange ? buildTimeline(start, end, filteredBookings) : { interval: 'day', rows: [] }, [end, filteredBookings, start, validRange])
  const customerGroups = useMemo(() => {
    const counts = new Map()
    filteredBookings.forEach((booking) => {
      const phone = String(booking.phone || '').replace(/\D/g, '')
      if (phone) counts.set(phone, (counts.get(phone) || 0) + 1)
    })
    return {
      identifiedBookings: [...counts.values()].reduce((sum, count) => sum + count, 0),
      uniqueCustomers: counts.size,
      repeatCustomers: [...counts.values()].filter((count) => count > 1).length,
    }
  }, [filteredBookings])

  const updatePreset = (value) => {
    setPreset(value)
    if (value !== 'Custom range') {
      const range = selectedDateRange(value)
      setDateFrom(range.from)
      setDateTo(range.to)
    }
  }

  const toggleSort = (table, key) => {
    setSorts((current) => {
      const selected = current[table]
      return {
        ...current,
        [table]: { key, direction: selected.key === key && selected.direction === 'asc' ? 'desc' : 'asc' },
      }
    })
  }

  const exportBookings = () => {
    const headers = ['Booking ID', 'Trip date', 'Customer', 'Phone', 'Pickup', 'Destination', 'Trip type', 'Vehicle category', 'Fare', 'Booking status', 'Payment status', 'Driver', 'Vehicle']
    const rows = filteredBookings.map((booking) => [
      booking.id, booking.date, booking.customer, booking.phone, booking.pickup, booking.destination,
      booking.tripType, booking.cab, booking.fare, booking.status, booking.paymentStatus,
      booking.driver, booking.vehicle,
    ])
    saveCsv([headers, ...rows], `reports-bookings-${rangeFilename(start, end)}.csv`)
  }

  const exportSummary = () => {
    const rows = [
      ['Report section', 'Category', 'Booking count', 'Revenue (INR)', 'Share (%)'],
      ['Overview', 'Total bookings', filteredBookings.length, '', ''],
      ['Overview', 'Completed bookings', completedBookings.length, '', ''],
      ['Overview', 'Cancelled bookings', cancelledBookings.length, '', ''],
      ['Overview', 'Revenue from completed bookings with valid fare', revenueBookings.length, totalRevenue, ''],
      ['Overview', 'Average booking value (revenue-eligible bookings)', revenueBookings.length, averageValue, ''],
      ['Overview', 'Completion rate', '', '', completionRate.toFixed(1)],
      ...statusRows.map((row) => ['Booking status', row.name, row.count, row.revenue, row.share.toFixed(1)]),
      ...tripRows.map((row) => ['Revenue by trip type', row.name, row.count, row.revenue, '']),
      ...vehicleRows.map((row) => ['Vehicle performance', row.name, row.count, row.revenue, '']),
      ...driverRows.map((row) => ['Driver performance', row.name, row.count, row.revenue, '']),
    ]
    saveCsv(rows, `reports-summary-${rangeFilename(start, end)}.csv`)
  }

  const statusChartRows = statusRows.map((row, index) => ({ ...row, color: statusColors[row.name] || palette[index % palette.length] }))
  const reportHasRows = filteredBookings.length > 0

  return <>
    <PageHeader title="Reports Management" description="Explore illustrative booking, revenue and fleet performance for the selected period.">
      <div className="reports-page-actions">
        <button type="button" className="secondary-button" onClick={exportSummary}><ArrowDownToLine size={14} />Export summaries</button>
        <button type="button" className="secondary-button" onClick={exportBookings}><ArrowDownToLine size={14} />Export bookings</button>
        <button type="button" className="secondary-button reports-print-button" onClick={() => window.print()}><Printer size={14} />Print</button>
      </div>
    </PageHeader>
    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Illustrative demo report</strong> — metrics are calculated from the dashboard's fictional local booking, enquiry and callback records.</span></div>
    <section className="reports-filter-panel panel" aria-label="Report date filters">
      <div className="reports-filter-heading"><div><h2>Date range</h2><p>All booking and revenue views use trip date; enquiries and callbacks use creation date.</p></div><strong><CalendarDays size={14} />{rangeLabel}</strong></div>
      <div className="reports-filter-controls">
        <label className="reports-filter-field"><span>Period</span><select aria-label="Report date preset" value={preset} onChange={(event) => updatePreset(event.target.value)}>{presets.map((item) => <option key={item}>{item}</option>)}</select></label>
        {(preset === 'Custom range') && <>
          <label className="reports-filter-field"><span>From</span><input aria-label="Report start date" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
          <label className="reports-filter-field"><span>To</span><input aria-label="Report end date" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
        </>}
        {preset !== 'Custom range' && <span className="reports-filter-selected">Showing {formatDate(start)} through {formatDate(end)}</span>}
      </div>
      {preset === 'Custom range' && (!dateFromKey(dateFrom) || !dateFromKey(dateTo) || dateTo < dateFrom)
        && <p className="reports-range-error" role="alert">{dateTo && dateFrom && dateTo < dateFrom ? 'End date cannot precede start date.' : 'Enter a valid start and end date.'}</p>}
    </section>

    <section className="reports-summary-grid" aria-label="Report summary">
      <SummaryCard label="Total bookings" value={number(filteredBookings.length)} note="Within selected trip dates" tone="blue" />
      <SummaryCard label="Completed bookings" value={number(completedBookings.length)} note="Status: Completed" tone="green" />
      <SummaryCard label="Cancelled bookings" value={number(cancelledBookings.length)} note="Status: Cancelled" tone="slate" />
      <SummaryCard label="Total demo revenue" value={rupees(totalRevenue)} note="Completed trips with valid fare" tone="violet" />
      <SummaryCard label="Average booking value" value={rupees(averageValue)} note={`${number(revenueBookings.length)} revenue-eligible trips`} tone="amber" />
      <SummaryCard label="Completion rate" value={`${completionRate.toFixed(1)}%`} note="Completed / total bookings" tone="cyan" />
    </section>

    <section className="reports-support-grid" aria-label="Related customer activity">
      <div className="reports-support-card"><span>Unique customers</span><strong>{number(customerGroups.uniqueCustomers)}</strong><small>Based on distinct phone numbers in filtered bookings</small></div>
      <div className="reports-support-card"><span>Repeat customers</span><strong>{number(customerGroups.repeatCustomers)}</strong><small>Customers with 2+ bookings in the selected range</small></div>
      <div className="reports-support-card"><span>Enquiries created</span><strong>{number(filteredEnquiries.length)}</strong><small>Created within the selected calendar range</small></div>
      <div className="reports-support-card"><span>Callbacks created</span><strong>{number(filteredCallbacks.length)}</strong><small>Created within the selected calendar range</small></div>
    </section>

    <section className="reports-section" aria-label="Booking analytics">
      <div className="reports-section-heading"><div><h2>Booking analytics</h2><p>Counts and distributions from bookings whose trip date falls in the selected range.</p></div></div>
      <div className="reports-chart-grid">
        <ChartPanel title="Bookings over time" subtitle={`Daily bookings${timeline.interval === 'month' ? ' grouped by month' : ''}`}>
          {timeline.rows.length ? <div className="reports-chart reports-chart-tall"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeline.rows} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#EEF1F5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [number(value), name]} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <Bar dataKey="bookings" name="Bookings" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="completed" name="Completed" fill="#8cb4ff" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer></div> : <ChartEmpty />}
        </ChartPanel>
        <ChartPanel title="Booking status distribution" subtitle="Booking count by current demo status">
          {statusChartRows.length ? <div className="reports-donut-layout">
            <div className="reports-donut"><ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={statusChartRows} dataKey="count" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="none">
                {statusChartRows.map((row) => <Cell key={row.name} fill={row.color} />)}
              </Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => [number(value), 'Bookings']} /></PieChart>
            </ResponsiveContainer><div className="reports-donut-center"><strong>{number(filteredBookings.length)}</strong><span>Bookings</span></div></div>
            <div className="reports-legend">{statusChartRows.map((row) => <div key={row.name}><span><i style={{ backgroundColor: row.color }} />{row.name}</span><strong>{number(row.count)}</strong></div>)}</div>
          </div> : <ChartEmpty />}
        </ChartPanel>
        <ChartPanel title="Trip type distribution" subtitle="Bookings grouped by the recorded trip type">
          {reportHasRows ? <div className="reports-chart"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupBy(filteredBookings, (booking) => booking.tripType)} layout="vertical" margin={{ top: 5, right: 20, left: 8, bottom: 4 }}>
              <CartesianGrid stroke="#EEF1F5" horizontal={false} />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={105} axisLine={false} tickLine={false} tick={{ fill: '#68768a', fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [number(value), 'Bookings']} />
              <Bar dataKey="count" name="Bookings" fill="#4d83e7" radius={[0, 4, 4, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer></div> : <ChartEmpty />}
        </ChartPanel>
        <ChartPanel title="Vehicle category distribution" subtitle="Cab category from each booking record">
          {cabRows.length ? <div className="reports-donut-layout">
            <div className="reports-donut"><ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={cabRows} dataKey="count" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="none">
                {cabRows.map((row) => <Cell key={row.name} fill={row.color} />)}
              </Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => [number(value), 'Bookings']} /></PieChart></ResponsiveContainer>
            </div>
            <div className="reports-legend">{cabRows.map((row) => <div key={row.name}><span><i style={{ backgroundColor: row.color }} />{row.name}</span><strong>{number(row.count)}</strong></div>)}</div>
          </div> : <ChartEmpty />}
        </ChartPanel>
      </div>
    </section>

    <section className="reports-section" aria-label="Revenue analytics">
      <div className="reports-section-heading"><div><h2>Revenue analytics</h2><p>Revenue basis: completed bookings with a recorded positive fare. Cancelled, rejected, and other statuses are excluded.</p></div></div>
      <div className="reports-chart-grid reports-revenue-grid">
        <ChartPanel title="Revenue over time" subtitle={`Completed booking fare${timeline.interval === 'month' ? ' grouped by month' : ''}`}>
          {timeline.rows.length ? <div className="reports-chart reports-chart-tall"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeline.rows} margin={{ top: 8, right: 12, left: -7, bottom: 0 }}>
              <CartesianGrid stroke="#EEF1F5" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)} axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [rupees(value), 'Revenue']} />
              <Bar dataKey="revenue" name="Revenue" fill="#10a76d" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer></div> : <ChartEmpty />}
        </ChartPanel>
        <ChartPanel title="Payment status distribution" subtitle="Payment status counts; not a cash collection report">
          {paymentRows.length ? <div className="reports-donut-layout">
            <div className="reports-donut"><ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={paymentRows} dataKey="count" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="none">
                {paymentRows.map((row) => <Cell key={row.name} fill={row.color} />)}
              </Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => [number(value), 'Bookings']} /></PieChart></ResponsiveContainer>
            </div>
            <div className="reports-legend">{paymentRows.map((row) => <div key={row.name}><span><i style={{ backgroundColor: row.color }} />{row.name}</span><strong>{number(row.count)}</strong></div>)}</div>
          </div> : <ChartEmpty />}
        </ChartPanel>
        <ChartPanel title="Revenue by trip type" subtitle="Completed bookings with a valid fare">
          {revenueByTrip.length ? <div className="reports-chart"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByTrip} layout="vertical" margin={{ top: 5, right: 22, left: 8, bottom: 4 }}>
              <CartesianGrid stroke="#EEF1F5" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)} axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={105} axisLine={false} tickLine={false} tick={{ fill: '#68768a', fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [rupees(value), 'Revenue']} />
              <Bar dataKey="revenue" name="Revenue" fill="#10a76d" radius={[0, 4, 4, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer></div> : <ChartEmpty>Revenue appears when completed bookings have a valid fare.</ChartEmpty>}
        </ChartPanel>
        <ChartPanel title="Revenue by vehicle category" subtitle="Revenue-eligible completed bookings">
          {revenueByCab.length ? <div className="reports-chart"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByCab} layout="vertical" margin={{ top: 5, right: 22, left: 8, bottom: 4 }}>
              <CartesianGrid stroke="#EEF1F5" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)} axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={105} axisLine={false} tickLine={false} tick={{ fill: '#68768a', fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => [rupees(value), 'Revenue']} />
              <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer></div> : <ChartEmpty>Revenue appears when completed bookings have a valid fare.</ChartEmpty>}
        </ChartPanel>
      </div>
    </section>

    <section className="reports-section" aria-label="Fleet and driver performance">
      <div className="reports-section-heading"><div><h2>Fleet and driver performance</h2><p>Assignments and completed trips are counted from booking records; no distance or utilization data is available.</p></div></div>
      <div className="reports-table-grid">
        <DetailTable title="Vehicle performance" description="Assignment count, completed trips and eligible revenue" rows={vehicleRows}
          emptyMessage="No vehicle performance records for this range." state={sorts.vehicle} onSort={(key) => toggleSort('vehicle', key)}
          columns={[
            { key: 'name', label: 'Vehicle', sortKey: 'name' },
            { key: 'category', label: 'Category', sortKey: 'category' },
            { key: 'count', label: 'Assignments', sortKey: 'count' },
            { key: 'completed', label: 'Completed', sortKey: 'completed' },
            { key: 'revenue', label: 'Revenue', sortKey: 'revenue', className: 'reports-money-cell', render: (value) => rupees(value) },
          ]} />
        <DetailTable title="Driver performance" description="Assigned bookings, completed trips and eligible revenue" rows={driverRows}
          emptyMessage="No driver performance records for this range." state={sorts.driver} onSort={(key) => toggleSort('driver', key)}
          columns={[
            { key: 'name', label: 'Driver', sortKey: 'name' },
            { key: 'count', label: 'Assignments', sortKey: 'count' },
            { key: 'completed', label: 'Completed', sortKey: 'completed' },
            { key: 'revenue', label: 'Revenue', sortKey: 'revenue', className: 'reports-money-cell', render: (value) => rupees(value) },
          ]} />
      </div>
    </section>

    <section className="reports-section" aria-label="Booking detail tables">
      <div className="reports-section-heading"><div><h2>Report tables</h2><p>Summaries use the same filtered booking set and date range as the charts above.</p></div></div>
      <div className="reports-table-grid">
        <DetailTable title="Booking summary by status" description="Count, share and eligible revenue for each status" rows={statusRows}
          emptyMessage="No bookings in this date range." state={sorts.status} onSort={(key) => toggleSort('status', key)}
          columns={[
            { key: 'name', label: 'Status', sortKey: 'name' },
            { key: 'count', label: 'Bookings', sortKey: 'count' },
            { key: 'share', label: 'Share', sortKey: 'share', render: (value) => `${value.toFixed(1)}%` },
            { key: 'revenue', label: 'Eligible revenue', sortKey: 'revenue', className: 'reports-money-cell', render: (value) => rupees(value) },
          ]} />
        <DetailTable title="Revenue by trip type" description="All bookings by trip type; revenue counts completed valid fares only" rows={tripRows}
          emptyMessage="No trip type records in this date range." state={sorts.trip} onSort={(key) => toggleSort('trip', key)}
          columns={[
            { key: 'name', label: 'Trip type', sortKey: 'name' },
            { key: 'count', label: 'Bookings', sortKey: 'count' },
            { key: 'revenue', label: 'Revenue', sortKey: 'revenue', className: 'reports-money-cell', render: (value) => rupees(value) },
          ]} />
        <DetailTable title="Booking detail" description={`${number(filteredBookings.length)} filtered booking records · trip date ${rangeLabel}`} rows={filteredBookings.map((booking) => ({
          id: booking.id, date: parseBookingDate(booking.date), bookingId: booking.id, customer: booking.customer,
          tripType: booking.tripType || 'Not recorded', status: booking.status || 'Not recorded',
          fare: validFare(booking), vehicle: booking.vehicle || 'Not recorded', driver: booking.driver || 'Not recorded',
        }))} emptyMessage="No bookings in this date range." className="reports-detail-table-panel" state={sorts.bookings} onSort={(key) => toggleSort('bookings', key)}
          columns={[
            { key: 'bookingId', label: 'Booking ID', sortKey: 'bookingId' },
            { key: 'date', label: 'Trip date', sortKey: 'date', render: (value) => formatDate(value) },
            { key: 'customer', label: 'Customer', sortKey: 'customer' },
            { key: 'tripType', label: 'Trip type', sortKey: 'tripType' },
            { key: 'status', label: 'Status', sortKey: 'status' },
            { key: 'fare', label: 'Eligible fare', sortKey: 'fare', className: 'reports-money-cell', render: (value) => value === null ? '—' : rupees(value) },
            { key: 'vehicle', label: 'Vehicle' },
            { key: 'driver', label: 'Driver' },
          ]} />
      </div>
    </section>

    <div className="reports-data-notes">
      <strong>Data notes</strong>
      <ul>
        <li>Booking analytics are limited to the eight records in the existing local booking fixture. Filters outside their trip dates correctly show no bookings.</li>
        <li>The booking schema has no service field; service-level metrics are unavailable. Trip type is reported as recorded and is not relabeled as a service.</li>
        <li>Revenue only includes completed bookings with a positive numeric fare. Payment status is a booking label, not a reconciliation of collected funds.</li>
        <li>New/repeat customers use distinct phone numbers; repeat status is only measured within the selected date range. Fleet utilization and distance-based performance are unavailable.</li>
      </ul>
    </div>
  </>
}
