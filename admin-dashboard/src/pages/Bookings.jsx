import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight, Ban, CalendarDays, Download, Edit3, Eye, Filter, Plus, Search, X,
  UserCheck, Car, Phone, MapPin, Clock, CheckCircle2, AlertCircle, ShieldAlert
} from 'lucide-react'
import StatusBadge from '../components/common/StatusBadge.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import {
  bookingDrivers,
  bookingStatusOptions,
  bookingVehicles,
  cabOptions,
  tripTypeOptions,
  mockBookings,
  CANONICAL_STATUSES,
  STATUS_LABELS,
} from '../data/mockBookings.js'
import {
  subscribeBookings,
  saveBooking as firestoreSaveBooking,
  updateBookingStatus as firestoreUpdateStatus,
  assignDriver as firestoreAssignDriver,
  deleteBooking as firestoreDeleteBooking,
} from '../services/adminFirestoreService.js'

const BOOKINGS_STORAGE_KEY = 'kcs_bookings_data'
const pageSizeOptions = [10, 20, 50]

const emptyForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  pickupLocation: '',
  dropLocation: '',
  pickupDate: '',
  pickupTime: '08:00',
  returnDate: '',
  tripType: 'one-way',
  vehicleCategory: 'Sedan',
  vehicleName: 'Maruti Dzire',
  estimatedFare: '',
  passengers: 4,
  luggage: 2,
  status: 'PENDING',
  driver: bookingDrivers[0],
  vehicle: bookingVehicles[0].id,
  additionalNotes: '',
  statusNotes: '',
}

function dateInputValue(value = '') {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function displayDate(value = '') {
  const normalized = dateInputValue(value)
  if (!normalized) return value || '—'
  const [year, month, day] = normalized.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day))
}

function isValidIndianPhone(value) {
  const normalized = String(value || '').trim().replace(/[\s()-]/g, '').replace(/^(?:\+91|91|0)/, '')
  return /^[6-9]\d{9}$/.test(normalized)
}

function getInitialBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge canonical defaults for missing properties
        return parsed.map((b) => ({
          ...b,
          customerName: b.customerName || b.customer || 'Customer',
          customerPhone: b.customerPhone || b.phone || '',
          pickupLocation: b.pickupLocation || b.pickup || 'Kolhapur',
          dropLocation: b.dropLocation || b.destination || '',
          pickupDate: b.pickupDate || b.date || '',
          vehicleCategory: b.vehicleCategory || b.cab || 'Sedan',
          estimatedFare: b.estimatedFare || b.fare || 0,
          additionalNotes: b.additionalNotes || b.notes || '',
        }))
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage', e)
  }
  return [...mockBookings]
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState(getInitialBookings)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [tripTypeFilter, setTripTypeFilter] = useState('All')
  const [cabFilter, setCabFilter] = useState('All')
  const [pickupDateFilter, setPickupDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [assignModalBooking, setAssignModalBooking] = useState(null)
  const [statusModalBooking, setStatusModalBooking] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})

  // Assignment form state
  const [selectedDriver, setSelectedDriver] = useState(bookingDrivers[0])
  const [selectedVehicleReg, setSelectedVehicleReg] = useState(bookingVehicles[0].id)

  // Status modal state
  const [newStatus, setNewStatus] = useState('CONFIRMED')
  const [statusNotesInput, setStatusNotesInput] = useState('')

  // Subscribe to real-time Firestore bookings
  useEffect(() => {
    const unsubscribe = subscribeBookings((firestoreBookings) => {
      if (firestoreBookings && firestoreBookings.length > 0) {
        setBookings(firestoreBookings)
      }
    })
    return () => unsubscribe()
  }, [])

  // Persist updates to localStorage
  const syncBookings = (updatedList) => {
    setBookings(updatedList)
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedList))
    } catch (e) {
      console.warn('Could not persist to localStorage', e)
    }
  }

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const q = query.trim().toLowerCase()
      const phoneDigits = (booking.customerPhone || booking.phone || '').replace(/\D/g, '')
      const qDigits = q.replace(/\D/g, '')

      const matchesQuery =
        !q ||
        `${booking.id} ${booking.customerName || booking.customer} ${booking.customerPhone || booking.phone} ${booking.pickupLocation || booking.pickup} ${booking.dropLocation || booking.destination}`
          .toLowerCase()
          .includes(q) ||
        (qDigits.length > 0 && phoneDigits.includes(qDigits))

      const currentStatus = String(booking.status || '').toUpperCase()
      const matchesStatus =
        statusFilter === 'All' ||
        currentStatus === statusFilter ||
        booking.status === statusFilter

      const matchesTripType =
        tripTypeFilter === 'All' ||
        String(booking.tripType || '').toLowerCase() === tripTypeFilter.toLowerCase()

      const cabVal = booking.vehicleCategory || booking.cab || ''
      const matchesCab =
        cabFilter === 'All' ||
        cabVal.toLowerCase().includes(cabFilter.toLowerCase())

      const matchesDate =
        !pickupDateFilter ||
        dateInputValue(booking.pickupDate || booking.date) === pickupDateFilter

      return matchesQuery && matchesStatus && matchesTripType && matchesCab && matchesDate
    })
  }, [bookings, cabFilter, pickupDateFilter, query, statusFilter, tripTypeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Metrics
  const summary = useMemo(() => {
    const total = bookings.length
    const pending = bookings.filter((b) => ['PENDING', 'UNDER_REVIEW', 'Pending', 'Under Review'].includes(b.status)).length
    const confirmed = bookings.filter((b) => ['CONFIRMED', 'DRIVER_ASSIGNED', 'QUOTED', 'Confirmed', 'Driver Assigned'].includes(b.status)).length
    const completed = bookings.filter((b) => ['COMPLETED', 'Completed'].includes(b.status)).length
    const revenue = bookings.reduce((sum, b) => {
      const isTerminal = ['CANCELLED', 'REJECTED', 'Cancelled', 'Rejected'].includes(b.status)
      return isTerminal ? sum : sum + Number(b.estimatedFare || b.fare || 0)
    }, 0)
    return { total, pending, confirmed, completed, revenue }
  }, [bookings])

  const handlePageChange = (nextPage) => setPage(Math.min(Math.max(nextPage, 1), totalPages))

  // Open Create Form
  const openCreateForm = () => {
    setEditingId('')
    setForm({ ...emptyForm })
    setFormErrors({})
    setSelectedBooking(null)
    setShowForm(true)
  }

  // Open Edit Form
  const openEditForm = (booking) => {
    setEditingId(booking.id)
    setForm({
      customerName: booking.customerName || booking.customer || '',
      customerPhone: booking.customerPhone || booking.phone || '',
      customerEmail: booking.customerEmail || '',
      pickupLocation: booking.pickupLocation || booking.pickup || '',
      dropLocation: booking.dropLocation || booking.destination || '',
      pickupDate: dateInputValue(booking.pickupDate || booking.date),
      pickupTime: booking.pickupTime || '08:00',
      returnDate: dateInputValue(booking.returnDate),
      tripType: booking.tripType || 'one-way',
      vehicleCategory: booking.vehicleCategory || booking.cab || 'Sedan',
      vehicleName: booking.vehicleName || 'Maruti Dzire',
      estimatedFare: booking.estimatedFare || booking.fare || '',
      passengers: booking.passengers || 4,
      luggage: booking.luggage || 2,
      status: booking.status || 'PENDING',
      driver: booking.driverDetails?.name || booking.driver || bookingDrivers[0],
      vehicle: booking.driverDetails?.vehicleReg || booking.vehicle || bookingVehicles[0].id,
      additionalNotes: booking.additionalNotes || booking.notes || '',
      statusNotes: booking.statusNotes || '',
    })
    setFormErrors({})
    setSelectedBooking(null)
    setShowForm(true)
  }

  const closeForm = useCallback(() => {
    setShowForm(false)
    setEditingId('')
    setForm({ ...emptyForm })
    setFormErrors({})
  }, [])

  // Form input change
  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((current) => {
      if (name === 'vehicleCategory') {
        const matchingVehicle = bookingVehicles.find((v) => v.type === value)
        return {
          ...current,
          vehicleCategory: value,
          vehicleName: matchingVehicle?.name || value,
          vehicle: matchingVehicle?.id || current.vehicle,
        }
      }
      return {
        ...current,
        [name]: ['estimatedFare', 'passengers', 'luggage'].includes(name)
          ? value === '' ? '' : Number(value)
          : value,
      }
    })
    setFormErrors((current) => ({ ...current, [name]: '' }))
  }

  // Submit create or edit
  const handleSubmit = (event) => {
    event.preventDefault()
    const errors = {}
    if (!form.customerName.trim()) errors.customerName = 'Enter customer name.'
    if (!form.customerPhone.trim()) errors.customerPhone = 'Enter phone number.'
    else if (!isValidIndianPhone(form.customerPhone)) errors.customerPhone = 'Enter a valid 10-digit Indian phone.'
    if (!form.pickupLocation.trim()) errors.pickupLocation = 'Enter pickup address in Kolhapur.'
    if (!form.dropLocation.trim()) errors.dropLocation = 'Enter drop destination.'
    if (!form.pickupDate) errors.pickupDate = 'Select pickup date.'
    if (form.tripType === 'round-trip' && form.returnDate && form.returnDate < form.pickupDate) {
      errors.returnDate = 'Return date must be on or after pickup date.'
    }
    if (form.estimatedFare === '' || Number(form.estimatedFare) <= 0) {
      errors.estimatedFare = 'Enter a valid estimated fare in ₹.'
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const now = new Date().toISOString()
    const payload = {
      id: editingId || `KCS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: form.customerName.trim(),
      customer: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      phone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim(),
      pickupLocation: form.pickupLocation.trim(),
      pickup: form.pickupLocation.trim(),
      dropLocation: form.dropLocation.trim(),
      destination: form.dropLocation.trim(),
      pickupDate: form.pickupDate,
      date: form.pickupDate,
      pickupTime: form.pickupTime || '08:00',
      returnDate: form.tripType === 'round-trip' ? form.returnDate : null,
      tripType: form.tripType,
      vehicleCategory: form.vehicleCategory,
      cab: form.vehicleCategory,
      vehicleName: form.vehicleName,
      estimatedFare: Number(form.estimatedFare),
      fare: Number(form.estimatedFare),
      passengers: Number(form.passengers) || 1,
      luggage: Number(form.luggage) || 0,
      status: form.status,
      driver: form.driver,
      vehicle: form.vehicle,
      additionalNotes: form.additionalNotes.trim(),
      notes: form.additionalNotes.trim(),
      statusNotes: form.statusNotes.trim() || 'Updated by dispatch controller.',
      createdAt: editingId ? undefined : now,
      updatedAt: now,
    }

    if (editingId) {
      const updated = bookings.map((b) => (b.id === editingId ? { ...b, ...payload } : b))
      syncBookings(updated)
    } else {
      syncBookings([payload, ...bookings])
    }
    firestoreSaveBooking(payload).catch((err) => console.warn('Firestore booking save error:', err))
    closeForm()
  }

  // Handle Driver Assignment
  const handleAssignDriver = () => {
    if (!assignModalBooking) return
    const matchedVehicle = bookingVehicles.find((v) => v.id === selectedVehicleReg)
    const driverDetails = {
      name: selectedDriver,
      phone: '+91 94220 98765',
      vehicleReg: selectedVehicleReg,
      vehicleModel: matchedVehicle?.name || 'Cab (AC)',
      rating: 4.9,
    }
    const statusNotes = `Driver ${selectedDriver} (${selectedVehicleReg}) assigned by dispatch desk.`
    firestoreAssignDriver(assignModalBooking.id, driverDetails, statusNotes).catch((err) =>
      console.warn('Firestore driver assignment error:', err)
    )

    const updated = bookings.map((b) => {
      if (b.id === assignModalBooking.id) {
        return {
          ...b,
          status: 'DRIVER_ASSIGNED',
          driver: selectedDriver,
          vehicle: selectedVehicleReg,
          driverDetails,
          statusNotes,
          updatedAt: new Date().toISOString(),
        }
      }
      return b
    })
    syncBookings(updated)
    setAssignModalBooking(null)
  }

  // Handle Status Update
  const handleUpdateStatus = () => {
    if (!statusModalBooking) return
    const note = statusNotesInput.trim() || `Status updated to ${STATUS_LABELS[newStatus] || newStatus}.`
    firestoreUpdateStatus(statusModalBooking.id, newStatus, note).catch((err) =>
      console.warn('Firestore status update error:', err)
    )

    const updated = bookings.map((b) => {
      if (b.id === statusModalBooking.id) {
        return {
          ...b,
          status: newStatus,
          statusNotes: note,
          updatedAt: new Date().toISOString(),
        }
      }
      return b
    })
    syncBookings(updated)
    setStatusModalBooking(null)
    setStatusNotesInput('')
  }

  return (
    <>
      <PageHeader
        title="Bookings Management"
        description="Monitor, quote, confirm, and assign chauffeurs for customer trip bookings in real-time."
      >
        <button className="primary-button" type="button" onClick={openCreateForm}>
          <Plus size={16} />
          <span>New Booking</span>
        </button>
      </PageHeader>

      {/* Summary KPI Cards */}
      <section className="stats-grid" aria-label="Bookings overview">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Bookings</span>
            <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><CalendarDays size={18} /></div>
          </div>
          <div className="stat-value">{summary.total}</div>
          <div className="stat-footer"><small>Active across all routes</small></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending & Review</span>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: '#d97706' }}>{summary.pending}</div>
          <div className="stat-footer"><small>Requires quote or confirmation</small></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Confirmed & Assigned</span>
            <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{summary.confirmed}</div>
          <div className="stat-footer"><small>Ready for journey dispatch</small></div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Trip Completed</span>
            <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value">{summary.completed}</div>
          <div className="stat-footer"><small>Estimated ₹{summary.revenue.toLocaleString('en-IN')}</small></div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              SEARCH BOOKING
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="ID, customer, phone, location..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                style={{ width: '100%', height: '38px', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '7px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              STATUS WORKFLOW
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '7px' }}
            >
              {bookingStatusOptions.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : STATUS_LABELS[st] || st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              TRIP TYPE
            </label>
            <select
              value={tripTypeFilter}
              onChange={(e) => { setTripTypeFilter(e.target.value); setPage(1) }}
              style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '7px' }}
            >
              <option value="All">All Trip Types</option>
              <option value="one-way">One Way Outstation</option>
              <option value="round-trip">Round Trip Holiday</option>
              <option value="local">Local Hourly Package</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              VEHICLE CATEGORY
            </label>
            <select
              value={cabFilter}
              onChange={(e) => { setCabFilter(e.target.value); setPage(1) }}
              style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '7px' }}
            >
              {cabOptions.map((opt) => (
                <option key={opt} value={opt}>{opt === 'All' ? 'All Vehicles' : opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              PICKUP DATE
            </label>
            <input
              type="date"
              value={pickupDateFilter}
              onChange={(e) => { setPickupDateFilter(e.target.value); setPage(1) }}
              style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '7px' }}
            />
          </div>
        </div>
      </section>

      {/* Bookings Table Panel */}
      <section className="panel bookings-panel">
        <div className="panel-heading">
          <div>
            <h2>Trips & Bookings Roster</h2>
            <p>Showing {filteredBookings.length} bookings matching criteria</p>
          </div>
          {(query || statusFilter !== 'All' || tripTypeFilter !== 'All' || cabFilter !== 'All' || pickupDateFilter) && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setQuery('')
                setStatusFilter('All')
                setTripTypeFilter('All')
                setCabFilter('All')
                setPickupDateFilter('')
                setPage(1)
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {paginatedBookings.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>REF ID</th>
                  <th>CUSTOMER & PHONE</th>
                  <th>ROUTE / LOCATIONS</th>
                  <th>DATE & TIME</th>
                  <th>VEHICLE</th>
                  <th>CHAUFFEUR</th>
                  <th>FARE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((b) => {
                  const custName = b.customerName || b.customer || 'Customer'
                  const custPhone = b.customerPhone || b.phone || '—'
                  const pickup = b.pickupLocation || b.pickup || 'Kolhapur'
                  const drop = b.dropLocation || b.destination || '—'
                  const pDate = b.pickupDate || b.date
                  const pTime = b.pickupTime || ''
                  const vehicleType = b.vehicleCategory || b.cab || 'Sedan'
                  const fare = b.estimatedFare || b.fare || 0
                  const driverName = b.driverDetails?.name || b.driver || null

                  return (
                    <tr key={b.id}>
                      <td className="booking-id" style={{ fontWeight: 700, color: '#1e293b' }}>
                        {b.id}
                        {b.tripType && (
                          <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'capitalize' }}>
                            {b.tripType.replace('-', ' ')}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="customer-cell">
                          <strong>{custName}</strong>
                          <small style={{ color: '#64748b' }}>{custPhone}</small>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: '220px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pickup}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            ↳ {drop}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{displayDate(pDate)}</div>
                        {pTime && <small style={{ color: '#64748b' }}>{pTime}</small>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{vehicleType}</span>
                        {b.vehicleName && <small style={{ display: 'block', color: '#64748b' }}>{b.vehicleName}</small>}
                      </td>
                      <td>
                        {driverName ? (
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>{driverName}</span>
                            <small style={{ display: 'block', color: '#64748b' }}>{b.driverDetails?.vehicleReg || b.vehicle}</small>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 600 }}>Unassigned</span>
                        )}
                      </td>
                      <td className="fare-cell" style={{ fontWeight: 700 }}>
                        ₹{Number(fare).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="icon-button"
                            title="View details"
                            onClick={() => setSelectedBooking(b)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Assign driver & vehicle"
                            onClick={() => {
                              setAssignModalBooking(b)
                              setSelectedDriver(b.driverDetails?.name || b.driver || bookingDrivers[0])
                              setSelectedVehicleReg(b.driverDetails?.vehicleReg || b.vehicle || bookingVehicles[0].id)
                            }}
                          >
                            <UserCheck size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Update status"
                            onClick={() => {
                              setStatusModalBooking(b)
                              setNewStatus(b.status || 'CONFIRMED')
                              setStatusNotesInput(b.statusNotes || '')
                            }}
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px', fontSize: '15px', color: '#64748b' }}>No bookings found matching your filters.</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setQuery('')
                setStatusFilter('All')
                setTripTypeFilter('All')
                setCabFilter('All')
                setPickupDateFilter('')
              }}
            >
              Clear Search & Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing Page {currentPage} of {totalPages} ({filteredBookings.length} total)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="secondary-button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* MODAL 1: VIEW BOOKING DETAILS */}
      {selectedBooking && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedBooking(null)}>
          <div className="booking-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">BOOKING DOSSIER</span>
                <h2 id="booking-modal-title">{selectedBooking.id}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedBooking(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>CURRENT STATUS</small>
                <StatusBadge status={selectedBooking.status} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>TOTAL FARE</small>
                <strong style={{ fontSize: '18px', color: '#0f172a' }}>
                  ₹{(selectedBooking.estimatedFare || selectedBooking.fare || 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="booking-detail-grid" style={{ gap: '14px' }}>
              <div>
                <small>Customer Name</small>
                <strong>{selectedBooking.customerName || selectedBooking.customer}</strong>
              </div>
              <div>
                <small>Phone Number</small>
                <strong>{selectedBooking.customerPhone || selectedBooking.phone}</strong>
              </div>
              <div>
                <small>Email Address</small>
                <strong>{selectedBooking.customerEmail || 'Not specified'}</strong>
              </div>
              <div>
                <small>Trip Type</small>
                <strong style={{ textTransform: 'capitalize' }}>{(selectedBooking.tripType || 'one-way').replace('-', ' ')}</strong>
              </div>
              <div>
                <small>Pickup Point</small>
                <strong>{selectedBooking.pickupLocation || selectedBooking.pickup}</strong>
              </div>
              <div>
                <small>Drop Destination</small>
                <strong>{selectedBooking.dropLocation || selectedBooking.destination}</strong>
              </div>
              <div>
                <small>Pickup Schedule</small>
                <strong>{displayDate(selectedBooking.pickupDate || selectedBooking.date)} at {selectedBooking.pickupTime || '08:00'}</strong>
              </div>
              <div>
                <small>Vehicle Category</small>
                <strong>{selectedBooking.vehicleCategory || selectedBooking.cab} ({selectedBooking.vehicleName || 'AC'})</strong>
              </div>
              <div>
                <small>Passengers / Luggage</small>
                <strong>{selectedBooking.passengers || 1} Passengers / {selectedBooking.luggage || 0} Bags</strong>
              </div>
              <div>
                <small>Assigned Chauffeur</small>
                <strong>{selectedBooking.driverDetails?.name || selectedBooking.driver || 'None Assigned'}</strong>
              </div>
            </div>

            {selectedBooking.statusNotes && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px' }}>
                <small style={{ display: 'block', fontWeight: 700, color: '#854d0e', marginBottom: '4px' }}>DISPATCH LOG / NOTES</small>
                <p style={{ margin: 0, fontSize: '12px', color: '#713f12' }}>{selectedBooking.statusNotes}</p>
              </div>
            )}

            {selectedBooking.additionalNotes && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#f1f5f9', borderRadius: '8px' }}>
                <small style={{ display: 'block', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>CUSTOMER INSTRUCTIONS</small>
                <p style={{ margin: 0, fontSize: '12px', color: '#334155' }}>{selectedBooking.additionalNotes}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  const b = selectedBooking
                  setSelectedBooking(null)
                  openEditForm(b)
                }}
              >
                <Edit3 size={15} /> Edit Booking
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => setSelectedBooking(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN DRIVER & VEHICLE */}
      {assignModalBooking && (
        <div className="modal-backdrop" role="presentation" onClick={() => setAssignModalBooking(null)}>
          <div className="booking-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">CHAUFFEUR ALLOCATION</span>
                <h2>Assign Driver & Cab</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setAssignModalBooking(null)}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 16px' }}>
              Assigning a verified driver for <strong>{assignModalBooking.id}</strong> ({assignModalBooking.customerName || assignModalBooking.customer} to {assignModalBooking.dropLocation || assignModalBooking.destination}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  SELECT CHAUFFEUR
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '7px', border: '1px solid #cbd5e1' }}
                >
                  {bookingDrivers.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  SELECT FLEET VEHICLE
                </label>
                <select
                  value={selectedVehicleReg}
                  onChange={(e) => setSelectedVehicleReg(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '7px', border: '1px solid #cbd5e1' }}
                >
                  {bookingVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.id} — {v.name} ({v.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" onClick={() => setAssignModalBooking(null)}>Cancel</button>
              <button type="button" className="primary-button" onClick={handleAssignDriver}>Confirm Assignment</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE STATUS WORKFLOW */}
      {statusModalBooking && (
        <div className="modal-backdrop" role="presentation" onClick={() => setStatusModalBooking(null)}>
          <div className="booking-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">STATUS PROGRESSION</span>
                <h2>Update Trip Status</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setStatusModalBooking(null)}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 16px' }}>
              Update workflow for booking <strong>{statusModalBooking.id}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  TARGET STATUS
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '7px', border: '1px solid #cbd5e1' }}
                >
                  {CANONICAL_STATUSES.map((st) => (
                    <option key={st} value={st}>{STATUS_LABELS[st] || st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  DISPATCH / CUSTOMER NOTES
                </label>
                <textarea
                  rows={3}
                  value={statusNotesInput}
                  onChange={(e) => setStatusNotesInput(e.target.value)}
                  placeholder="Notes visible in customer tracking and admin audit trail..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button type="button" className="secondary-button" onClick={() => setStatusModalBooking(null)}>Cancel</button>
              <button type="button" className="primary-button" onClick={handleUpdateStatus}>Save Status</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE / EDIT BOOKING FORM */}
      {showForm && (
        <div className="modal-backdrop" role="presentation" onClick={closeForm}>
          <div className="booking-modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">{editingId ? 'EDIT TRIP' : 'DISPATCH ENTRY'}</span>
                <h2>{editingId ? `Edit Booking ${editingId}` : 'New Customer Booking'}</h2>
              </div>
              <button className="icon-button" type="button" onClick={closeForm}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    CUSTOMER FULL NAME *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleFormChange}
                    placeholder="e.g. Rahul Jadhav"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: `1px solid ${formErrors.customerName ? '#ef4444' : '#cbd5e1'}`, borderRadius: '6px' }}
                  />
                  {formErrors.customerName && <small style={{ color: '#ef4444' }}>{formErrors.customerName}</small>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    PHONE NUMBER *
                  </label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={handleFormChange}
                    placeholder="e.g. +91 98220 12345"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: `1px solid ${formErrors.customerPhone ? '#ef4444' : '#cbd5e1'}`, borderRadius: '6px' }}
                  />
                  {formErrors.customerPhone && <small style={{ color: '#ef4444' }}>{formErrors.customerPhone}</small>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={form.customerEmail}
                    onChange={handleFormChange}
                    placeholder="e.g. rahul@example.com"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    TRIP TYPE
                  </label>
                  <select
                    name="tripType"
                    value={form.tripType}
                    onChange={handleFormChange}
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="one-way">One-Way Outstation</option>
                    <option value="round-trip">Round-Trip Holiday</option>
                    <option value="local">Local City Package</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    PICKUP LOCATION IN KOLHAPUR *
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={form.pickupLocation}
                    onChange={handleFormChange}
                    placeholder="e.g. Rajarampuri, CBS Kolhapur"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: `1px solid ${formErrors.pickupLocation ? '#ef4444' : '#cbd5e1'}`, borderRadius: '6px' }}
                  />
                  {formErrors.pickupLocation && <small style={{ color: '#ef4444' }}>{formErrors.pickupLocation}</small>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    DROP DESTINATION *
                  </label>
                  <input
                    type="text"
                    name="dropLocation"
                    value={form.dropLocation}
                    onChange={handleFormChange}
                    placeholder="e.g. Pune Airport (PNQ), Goa"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: `1px solid ${formErrors.dropLocation ? '#ef4444' : '#cbd5e1'}`, borderRadius: '6px' }}
                  />
                  {formErrors.dropLocation && <small style={{ color: '#ef4444' }}>{formErrors.dropLocation}</small>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    PICKUP DATE *
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={form.pickupDate}
                    onChange={handleFormChange}
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: `1px solid ${formErrors.pickupDate ? '#ef4444' : '#cbd5e1'}`, borderRadius: '6px' }}
                  />
                  {formErrors.pickupDate && <small style={{ color: '#ef4444' }}>{formErrors.pickupDate}</small>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    PICKUP TIME
                  </label>
                  <input
                    type="time"
                    name="pickupTime"
                    value={form.pickupTime}
                    onChange={handleFormChange}
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                {form.tripType === 'round-trip' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      RETURN DATE
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      value={form.returnDate}
                      onChange={handleFormChange}
                      style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                    {formErrors.returnDate && <small style={{ color: '#ef4444' }}>{formErrors.returnDate}</small>}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    VEHICLE CATEGORY
                  </label>
                  <select
                    name="vehicleCategory"
                    value={form.vehicleCategory}
                    onChange={handleFormChange}
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="Sedan">Sedan (Dzire / Amaze)</option>
                    <option value="SUV">SUV (Ertiga New Gen)</option>
                    <option value="Luxury SUV">Luxury SUV (Innova Crysta)</option>
                    <option value="Hatchback">Hatchback (Swift / WagonR)</option>
                    <option value="Tempo Traveller">Tempo Traveller (17 / 26)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    ESTIMATED FARE (₹) *
                  </label>
                  <input
                    type="number"
                    name="estimatedFare"
                    value={form.estimatedFare}
                    onChange={handleFormChange}
                    placeholder="e.g. 3400"
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: `1px solid ${formErrors.estimatedFare ? '#ef4444' : '#cbd5e1'}`, borderRadius: '6px' }}
                  />
                  {formErrors.estimatedFare && <small style={{ color: '#ef4444' }}>{formErrors.estimatedFare}</small>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    STATUS
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    style={{ width: '100%', height: '38px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    {CANONICAL_STATUSES.map((st) => (
                      <option key={st} value={st}>{STATUS_LABELS[st] || st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  CUSTOMER INSTRUCTIONS / NOTES
                </label>
                <textarea
                  name="additionalNotes"
                  value={form.additionalNotes}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="e.g. Flight timing, elderly passenger luggage assistance..."
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" className="secondary-button" onClick={closeForm}>Cancel</button>
                <button type="submit" className="primary-button">{editingId ? 'Save Changes' : 'Create Booking'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
