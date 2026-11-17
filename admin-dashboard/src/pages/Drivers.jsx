import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, ClipboardCheck, Download, Edit3, Eye, Filter, Plus, Search, Trash2, UserRound, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import {
  driverStatuses,
  licenceTypes,
  mockDrivers,
  preferredVehicleCategories,
  verificationStatuses,
} from '../data/mockDrivers.js'
import {
  subscribeDrivers,
  saveDriver as firestoreSaveDriver,
  deleteDriver as firestoreDeleteDriver,
} from '../services/adminFirestoreService.js'

const pageSizes = [10, 20, 50]
const allFilter = 'All'
const emptyDriver = {
  name: '', phone: '', email: '', address: '', dateOfBirth: '', emergencyName: '', emergencyPhone: '',
  licenceNumber: '', licenceType: 'LMV', licenceExpiry: '', experience: '', languages: '',
  preferredCategories: [], joiningDate: '', status: 'Available', vehicleRegistration: '', paymentRate: '',
  aadhaarStatus: 'Pending', policeStatus: 'Pending', medicalExpiry: '', notes: '',
}

function normalizedPhone(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

function validIndianPhone(value) {
  return /^[6-9]\d{9}$/.test(normalizedPhone(value))
}

function normalizedLicence(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function validLicence(value) {
  const normalized = normalizedLicence(value)
  return /^[A-Z0-9]{8,20}$/.test(normalized)
}

function dateValue(value = '') {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(value = '') {
  const normalized = dateValue(value)
  if (!normalized) return '—'
  const [year, month, day] = normalized.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day))
}

function documentState(value) {
  if (!dateValue(value)) return { state: 'missing', label: 'Date not set' }
  const [year, month, day] = value.split('-').map(Number)
  const expiry = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
  if (days < 0) return { state: 'expired', label: 'Expired' }
  if (days <= 30) return { state: 'soon', label: days === 0 ? 'Expires today' : `Expires in ${days}d` }
  return { state: 'valid', label: 'Valid' }
}

function verificationLabel(driver) {
  if (driver.aadhaarStatus === 'Rejected' || driver.policeStatus === 'Rejected') return 'Rejected'
  if (driver.aadhaarStatus === 'Pending' || driver.policeStatus === 'Pending') return 'Pending'
  return 'Verified'
}

function driverInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase()
}

function nextDriverId(sequence, drivers) {
  const existing = new Set(drivers.map((driver) => driver.id))
  while (existing.has(`DRV-${sequence.current}`)) sequence.current += 1
  return `DRV-${sequence.current++}`
}

function saveCsv(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'drivers-export.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState(mockDrivers)

  // Subscribe to real-time Firestore drivers
  useEffect(() => {
    const unsubscribe = subscribeDrivers((firestoreDrivers) => {
      if (firestoreDrivers && firestoreDrivers.length > 0) {
        setDrivers(firestoreDrivers)
      }
    })
    return () => unsubscribe()
  }, [])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(allFilter)
  const [licenceFilter, setLicenceFilter] = useState(allFilter)
  const [verificationFilter, setVerificationFilter] = useState(allFilter)
  const [categoryFilter, setCategoryFilter] = useState(allFilter)
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyDriver)
  const [errors, setErrors] = useState({})
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [verificationDriver, setVerificationDriver] = useState(null)
  const [toast, setToast] = useState('')
  const sequence = useRef(mockDrivers.reduce((highest, driver) => {
    const match = /^DRV-(\d+)$/.exec(driver.id)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 1000) + 1)

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase()
    const digits = query.replace(/\D/g, '')
    return drivers.filter((driver) => {
      const matchesSearch = !query
        || [driver.id, driver.name, driver.phone, driver.licenceNumber].some((value) => value.toLowerCase().includes(query))
        || (digits.length > 0 && driver.phone.replace(/\D/g, '').includes(digits))
      const matchesStatus = statusFilter === allFilter || driver.status === statusFilter
      const matchesLicence = licenceFilter === allFilter || driver.licenceType === licenceFilter
      const matchesVerification = verificationFilter === allFilter || verificationLabel(driver) === verificationFilter
      const matchesCategory = categoryFilter === allFilter || driver.preferredCategories.includes(categoryFilter)
      return matchesSearch && matchesStatus && matchesLicence && matchesVerification && matchesCategory
    }).sort((first, second) => {
      let a = first[sortBy]
      let b = second[sortBy]
      if (sortBy === 'licenceExpiry') {
        a = dateValue(a) || ''
        b = dateValue(b) || ''
      }
      const comparison = typeof a === 'number' ? a - b : String(a ?? '').localeCompare(String(b ?? ''), 'en', { sensitivity: 'base' })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [categoryFilter, drivers, licenceFilter, search, sortBy, sortDirection, statusFilter, verificationFilter])

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageDrivers = filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const summary = useMemo(() => ({
    total: drivers.length,
    available: drivers.filter((driver) => driver.status === 'Available').length,
    onTrip: drivers.filter((driver) => driver.status === 'On Trip').length,
    onLeave: drivers.filter((driver) => driver.status === 'On Leave').length,
    inactive: drivers.filter((driver) => driver.status === 'Inactive').length,
  }), [drivers])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter(allFilter)
    setLicenceFilter(allFilter)
    setVerificationFilter(allFilter)
    setCategoryFilter(allFilter)
    setPage(1)
  }

  const sort = (key) => {
    if (sortBy === key) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')
    else {
      setSortBy(key)
      setSortDirection('asc')
    }
    setPage(1)
  }

  const openAdd = () => {
    setEditingId('')
    setForm({ ...emptyDriver })
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (driver) => {
    setEditingId(driver.id)
    setForm({
      ...driver,
      dateOfBirth: dateValue(driver.dateOfBirth),
      joiningDate: dateValue(driver.joiningDate),
      licenceExpiry: dateValue(driver.licenceExpiry),
      medicalExpiry: dateValue(driver.medicalExpiry),
      languages: driver.languages.join(', '),
      preferredCategories: [...driver.preferredCategories],
    })
    setErrors({})
    setSelectedDriver(null)
    setFormOpen(true)
  }

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyDriver })
    setErrors({})
  }, [])

  useEffect(() => {
    if (!(formOpen || selectedDriver || confirmation || verificationDriver)) return undefined
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      if (confirmation) setConfirmation(null)
      else if (verificationDriver) setVerificationDriver(null)
      else if (formOpen) closeForm()
      else setSelectedDriver(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [closeForm, confirmation, formOpen, selectedDriver, verificationDriver])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: ['experience', 'paymentRate'].includes(name) ? (value === '' ? '' : Number(value)) : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const toggleCategory = (category) => {
    setForm((current) => ({
      ...current,
      preferredCategories: current.preferredCategories.includes(category)
        ? current.preferredCategories.filter((item) => item !== category)
        : [...current.preferredCategories, category],
    }))
  }

  const submitForm = (event) => {
    event.preventDefault()
    const validation = {}
    const today = localDateString()
    const phone = normalizedPhone(form.phone)
    const duplicatePhone = drivers.some((driver) => driver.id !== editingId && normalizedPhone(driver.phone) === phone)
    const licence = normalizedLicence(form.licenceNumber)
    const duplicateLicence = drivers.some((driver) => driver.id !== editingId && normalizedLicence(driver.licenceNumber) === licence)
    const dateFields = [
      ['dateOfBirth', 'Date of birth'],
      ['joiningDate', 'Joining date'],
      ['licenceExpiry', 'Licence expiry'],
      ['medicalExpiry', 'Medical fitness expiry'],
    ]

    if (!form.name.trim()) validation.name = 'Enter the driver’s full name.'
    if (!form.phone.trim()) validation.phone = 'Enter a mobile number.'
    else if (!validIndianPhone(form.phone)) validation.phone = 'Enter a valid Indian mobile number (10 digits, starting 6–9).'
    else if (duplicatePhone) validation.phone = 'This phone number is already used by another driver.'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) validation.email = 'Enter a valid email address or leave this blank.'
    if (!form.address.trim()) validation.address = 'Enter the driver’s address.'
    if (!form.emergencyName.trim()) validation.emergencyName = 'Enter an emergency contact name.'
    if (!form.emergencyPhone.trim()) validation.emergencyPhone = 'Enter an emergency contact mobile number.'
    else if (!validIndianPhone(form.emergencyPhone)) validation.emergencyPhone = 'Enter a valid Indian mobile number.'
    if (!form.licenceNumber.trim()) validation.licenceNumber = 'Enter a driving licence number.'
    else if (!validLicence(form.licenceNumber)) validation.licenceNumber = 'Use 8–20 letters or numbers; spaces, hyphens, and slashes are allowed.'
    else if (duplicateLicence) validation.licenceNumber = 'This licence number is already used by another driver.'
    if (form.experience === '' || !Number.isFinite(Number(form.experience)) || Number(form.experience) < 0) validation.experience = 'Experience must be a non-negative number.'
    if (form.paymentRate === '' || !Number.isFinite(Number(form.paymentRate)) || Number(form.paymentRate) < 0) validation.paymentRate = 'Payment rate must be a non-negative amount.'
    for (const [field, label] of dateFields) {
      if (!dateValue(form[field])) validation[field] = `Enter a valid ${label.toLowerCase()}.`
      else if (field === 'dateOfBirth' && form[field] >= today) validation[field] = 'Date of birth must be in the past.'
      else if (field === 'joiningDate' && form[field] > today) validation[field] = 'Joining date cannot be in the future.'
    }
    if (form.dateOfBirth && form.joiningDate && form.dateOfBirth >= form.joiningDate) validation.joiningDate = 'Joining date must be after the date of birth.'
    setErrors(validation)
    if (Object.keys(validation).length) return

    const saved = {
      ...form,
      id: editingId || nextDriverId(sequence, drivers),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      emergencyName: form.emergencyName.trim(),
      emergencyPhone: form.emergencyPhone.trim(),
      licenceNumber: form.licenceNumber.trim().toUpperCase(),
      experience: Number(form.experience),
      paymentRate: Number(form.paymentRate),
      languages: form.languages.split(',').map((language) => language.trim()).filter(Boolean),
      preferredCategories: [...form.preferredCategories],
      notes: form.notes.trim(),
    }
    setDrivers((current) => editingId
      ? current.map((driver) => driver.id === editingId ? saved : driver)
      : [saved, ...current])
    firestoreSaveDriver(saved).catch((err) => console.warn('Firestore driver save error:', err))
    closeForm()
    notify(editingId ? 'Driver profile updated.' : `${saved.name} added successfully.`)
  }

  const applyStatus = () => {
    if (!confirmation) return
    const updated = { ...confirmation.driver, status: confirmation.status }
    setDrivers((current) => current.map((driver) => driver.id === confirmation.driver.id ? updated : driver))
    firestoreSaveDriver(updated).catch((err) => console.warn('Firestore driver status error:', err))
    notify(`${confirmation.driver.name} status changed to ${confirmation.status}.`)
    setConfirmation(null)
  }

  const applyVerification = () => {
    if (!verificationDriver) return
    const updated = { ...verificationDriver, aadhaarStatus: verificationDriver.aadhaarStatus, policeStatus: verificationDriver.policeStatus }
    setDrivers((current) => current.map((driver) => driver.id === verificationDriver.id ? updated : driver))
    firestoreSaveDriver(updated).catch((err) => console.warn('Firestore driver verification error:', err))
    notify(`${verificationDriver.name} verification statuses updated.`)
    setVerificationDriver(null)
  }

  const deleteDriver = () => {
    if (!confirmation) return
    const deletingId = confirmation.driver.id
    setDrivers((current) => current.filter((driver) => driver.id !== deletingId))
    firestoreDeleteDriver(deletingId).catch((err) => console.warn('Firestore driver delete error:', err))
    setPage((current) => Math.max(1, Math.min(current, Math.ceil(Math.max(0, filteredDrivers.length - 1) / pageSize))))
    notify(`${confirmation.driver.name} was deleted.`)
    setConfirmation(null)
  }

  const exportCsv = () => {
    const headers = [
      'Driver ID', 'Full name', 'Phone', 'Email', 'Address', 'Date of birth', 'Emergency contact',
      'Emergency phone', 'Licence number', 'Licence type', 'Licence expiry', 'Experience years',
      'Languages', 'Preferred vehicle categories', 'Joining date', 'Status', 'Vehicle registration reference',
      'Payment rate', 'Aadhaar verification status', 'Police verification status',
      'Medical fitness expiry', 'Notes',
    ]
    const rows = filteredDrivers.map((driver) => [
      driver.id, driver.name, driver.phone, driver.email, driver.address, formatDate(driver.dateOfBirth),
      driver.emergencyName, driver.emergencyPhone, driver.licenceNumber, driver.licenceType,
      formatDate(driver.licenceExpiry), driver.experience, driver.languages.join(', '),
      driver.preferredCategories.join(', '), formatDate(driver.joiningDate), driver.status,
      driver.vehicleRegistration, driver.paymentRate, driver.aadhaarStatus, driver.policeStatus,
      formatDate(driver.medicalExpiry), driver.notes,
    ])
    saveCsv([headers, ...rows])
  }

  return (
    <>
      <PageHeader title="Drivers" description="Manage driver profiles, documents and availability.">
        <div className="driver-page-actions">
          <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
          <button type="button" className="primary-button" onClick={openAdd}><Plus size={14} />Add Driver</button>
        </div>
      </PageHeader>
      <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Demo driver records</strong> — all profile details are fictional sample data for interface preview only.</span></div>
      <section className="driver-summary-grid" aria-label="Driver overview">
        <SummaryCard label="Total Drivers" value={summary.total} tone="blue" />
        <SummaryCard label="Available" value={summary.available} tone="green" />
        <SummaryCard label="On Trip" value={summary.onTrip} tone="violet" />
        <SummaryCard label="On Leave" value={summary.onLeave} tone="amber" />
        <SummaryCard label="Inactive" value={summary.inactive} tone="slate" />
      </section>
      {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

      <section className="panel driver-management-panel">
        <div className="panel-heading driver-panel-heading">
          <div><h2>Driver roster</h2><p>Search, filter, and maintain driver profiles.</p></div>
          <span className="vehicle-result-count">{filteredDrivers.length} drivers</span>
        </div>
        <div className="driver-filters">
          <label className="search-field"><Search size={15} /><input type="search" aria-label="Search drivers" placeholder="Search ID, name, phone or licence..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
          <FilterControl label="Filter by driver status" value={statusFilter} options={['All statuses', ...driverStatuses]} onChange={(value) => { setStatusFilter(value === 'All statuses' ? allFilter : value); setPage(1) }} />
          <FilterControl label="Filter by licence type" value={licenceFilter} options={['All licence types', ...licenceTypes]} onChange={(value) => { setLicenceFilter(value === 'All licence types' ? allFilter : value); setPage(1) }} />
          <FilterControl label="Filter by verification status" value={verificationFilter} options={['All verification statuses', ...verificationStatuses]} onChange={(value) => { setVerificationFilter(value === 'All verification statuses' ? allFilter : value); setPage(1) }} />
          <FilterControl label="Filter by preferred vehicle category" value={categoryFilter} options={['All vehicle categories', ...preferredVehicleCategories]} onChange={(value) => { setCategoryFilter(value === 'All vehicle categories' ? allFilter : value); setPage(1) }} />
          <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear All Filters</button>
        </div>

        <div className="table-scroll driver-table-scroll">
          <table className="data-table driver-table">
            <thead><tr>
              <th><SortButton sortKey="name" sortBy={sortBy} direction={sortDirection} onClick={sort}>Driver</SortButton></th>
              <th><SortButton sortKey="id" sortBy={sortBy} direction={sortDirection} onClick={sort}>Driver ID</SortButton></th>
              <th>Phone</th>
              <th>Licence number</th>
              <th><SortButton sortKey="licenceExpiry" sortBy={sortBy} direction={sortDirection} onClick={sort}>Licence expiry</SortButton></th>
              <th><SortButton sortKey="experience" sortBy={sortBy} direction={sortDirection} onClick={sort}>Experience</SortButton></th>
              <th>Verification</th>
              <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={sort}>Status</SortButton></th>
              <th>Actions</th>
            </tr></thead>
            <tbody>
              {pageDrivers.length ? pageDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td><div className="driver-identity"><span className="driver-avatar">{driverInitials(driver.name)}</span><span><strong>{driver.name}</strong><small>{driver.email || 'Email not provided'}</small></span></div></td>
                  <td className="driver-id-cell">{driver.id}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.licenceNumber}</td>
                  <td><div className="driver-expiry-cell"><span>{formatDate(driver.licenceExpiry)}</span><ExpiryBadge value={driver.licenceExpiry} /></div></td>
                  <td>{driver.experience} yrs</td>
                  <td><VerificationBadges driver={driver} /></td>
                  <td><StatusBadge status={driver.status} /></td>
                  <td className="driver-actions-cell">
                    <button className="table-action-button" type="button" aria-label={`View ${driver.id}`} onClick={() => setSelectedDriver(driver)}><Eye size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Edit ${driver.id}`} onClick={() => openEdit(driver)}><Edit3 size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Change status for ${driver.id}`} onClick={() => setConfirmation({ type: 'status', driver, status: driver.status })}><ArrowUpDown size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Manage verification for ${driver.id}`} onClick={() => setVerificationDriver({ ...driver })}><ClipboardCheck size={15} /></button>
                    <button className="table-action-button danger-button" type="button" aria-label={`Delete ${driver.id}`} onClick={() => setConfirmation({ type: 'delete', driver })}><Trash2 size={15} /></button>
                  </td>
                </tr>
              )) : <tr><td colSpan="9"><div className="empty-state driver-empty-state"><UserRound size={20} /><strong>No drivers found</strong><span>Adjust your search or filters, or clear all filters to see the full roster.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination-row driver-pagination">
          <label className="page-size-control">Rows per page<select aria-label="Drivers rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{pageSizes.map((size) => <option key={size}>{size}</option>)}</select></label>
          <span className="pagination-count">{filteredDrivers.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredDrivers.length)} of ${filteredDrivers.length}` : '0 drivers'}</span>
          <button className="secondary-button" type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button className="secondary-button" type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </section>

      {selectedDriver && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedDriver(null)}>
          <section className="driver-details-modal" role="dialog" aria-modal="true" aria-labelledby="driver-details-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header driver-details-header">
              <div className="driver-details-heading"><span className="driver-avatar driver-avatar-large">{driverInitials(selectedDriver.name)}</span><div><span className="eyebrow">DRIVER DETAILS · {selectedDriver.id}</span><h2 id="driver-details-title">{selectedDriver.name}</h2><p>{selectedDriver.phone} · {selectedDriver.email || 'No email'}</p></div></div>
              <button className="icon-button" type="button" aria-label="Close driver details" onClick={() => setSelectedDriver(null)}><X size={18} /></button>
            </div>
            <div className="driver-detail-status"><StatusBadge status={selectedDriver.status} /><VerificationBadges driver={selectedDriver} /></div>
            <DetailSection title="Personal information">
              <DetailItem label="Driver ID" value={selectedDriver.id} /><DetailItem label="Phone" value={selectedDriver.phone} />
              <DetailItem label="Email" value={selectedDriver.email || 'Not provided'} /><DetailItem label="Address" value={selectedDriver.address} />
              <DetailItem label="Date of birth" value={formatDate(selectedDriver.dateOfBirth)} /><DetailItem label="Emergency contact" value={selectedDriver.emergencyName} />
              <DetailItem label="Emergency phone" value={selectedDriver.emergencyPhone} />
            </DetailSection>
            <DetailSection title="Driving licence & experience">
              <DetailItem label="Licence number" value={selectedDriver.licenceNumber} /><DetailItem label="Licence type" value={selectedDriver.licenceType} />
              <DetailItem label="Licence expiry" value={formatDate(selectedDriver.licenceExpiry)} /><ExpiryDetail label="Licence document" value={selectedDriver.licenceExpiry} />
              <DetailItem label="Experience" value={`${selectedDriver.experience} years`} /><DetailItem label="Languages" value={selectedDriver.languages.join(', ')} />
              <DetailItem label="Preferred vehicle categories" value={selectedDriver.preferredCategories.join(', ')} />
            </DetailSection>
            <DetailSection title="Employment & documents">
              <DetailItem label="Joining date" value={formatDate(selectedDriver.joiningDate)} /><DetailItem label="Current status" value={selectedDriver.status} />
              <DetailItem label="Vehicle reference" value={selectedDriver.vehicleRegistration || 'None'} /><DetailItem label="Payment rate" value={`₹${Number(selectedDriver.paymentRate).toLocaleString('en-IN')}`} />
              <DetailItem label="Aadhaar verification" value={selectedDriver.aadhaarStatus} /><DetailItem label="Police verification" value={selectedDriver.policeStatus} />
              <ExpiryDetail label="Medical fitness certificate" value={selectedDriver.medicalExpiry} />
            </DetailSection>
            <div className="driver-notes"><strong>Notes</strong><p>{selectedDriver.notes || 'No notes added.'}</p></div>
            <div className="booking-modal-actions">
              <button type="button" className="secondary-button" onClick={() => { setVerificationDriver({ ...selectedDriver }); setSelectedDriver(null) }}>Update verification</button>
              <button type="button" className="secondary-button" onClick={() => openEdit(selectedDriver)}>Edit driver</button>
              <button type="button" className="primary-button" onClick={() => setSelectedDriver(null)}>Done</button>
            </div>
          </section>
        </div>
      )}

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeForm}>
          <section className="driver-form-modal" role="dialog" aria-modal="true" aria-labelledby="driver-form-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><span className="eyebrow">{editingId ? 'EDIT DRIVER' : 'NEW DRIVER'}</span><h2 id="driver-form-title">{editingId ? 'Update driver profile' : 'Add driver'}</h2></div><button className="icon-button" type="button" aria-label="Close driver form" onClick={closeForm}><X size={18} /></button></div>
            <form className="driver-form" noValidate onSubmit={submitForm}>
              <FormSection title="Personal information">
                <FormField label="Full name" error={errors.name}><input name="name" value={form.name} onChange={updateForm} required aria-invalid={Boolean(errors.name)} /></FormField>
                <FormField label="Phone number" error={errors.phone}><input name="phone" type="tel" inputMode="tel" value={form.phone} onChange={updateForm} required aria-invalid={Boolean(errors.phone)} /></FormField>
                <FormField label="Email (optional)" error={errors.email}><input name="email" type="email" value={form.email} onChange={updateForm} aria-invalid={Boolean(errors.email)} /></FormField>
                <FormField label="Date of birth" error={errors.dateOfBirth}><input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateForm} aria-invalid={Boolean(errors.dateOfBirth)} /></FormField>
                <FormField label="Address" error={errors.address}><input name="address" value={form.address} onChange={updateForm} aria-invalid={Boolean(errors.address)} /></FormField>
                <FormField label="Emergency contact name" error={errors.emergencyName}><input name="emergencyName" value={form.emergencyName} onChange={updateForm} aria-invalid={Boolean(errors.emergencyName)} /></FormField>
                <FormField label="Emergency contact phone" error={errors.emergencyPhone}><input name="emergencyPhone" type="tel" inputMode="tel" value={form.emergencyPhone} onChange={updateForm} aria-invalid={Boolean(errors.emergencyPhone)} /></FormField>
              </FormSection>
              <FormSection title="Driving licence & experience">
                <FormField label="Driving licence number" error={errors.licenceNumber}><input name="licenceNumber" value={form.licenceNumber} onChange={updateForm} aria-invalid={Boolean(errors.licenceNumber)} placeholder="e.g. MH09-20100001234" /></FormField>
                <FormField label="Licence type"><select name="licenceType" value={form.licenceType} onChange={updateForm}>{licenceTypes.map((type) => <option key={type}>{type}</option>)}</select></FormField>
                <FormField label="Licence expiry" error={errors.licenceExpiry}><input name="licenceExpiry" type="date" value={form.licenceExpiry} onChange={updateForm} aria-invalid={Boolean(errors.licenceExpiry)} /></FormField>
                <FormField label="Driving experience (years)" error={errors.experience}><input name="experience" type="number" min="0" step="1" value={form.experience} onChange={updateForm} aria-invalid={Boolean(errors.experience)} /></FormField>
                <FormField label="Languages (comma-separated)"><input name="languages" value={form.languages} onChange={updateForm} placeholder="Marathi, Hindi, English" /></FormField>
                <fieldset className="driver-category-field"><legend>Preferred vehicle categories</legend><div className="driver-category-options">{preferredVehicleCategories.map((category) => <label key={category}><input type="checkbox" checked={form.preferredCategories.includes(category)} onChange={() => toggleCategory(category)} />{category}</label>)}</div></fieldset>
              </FormSection>
              <FormSection title="Employment information">
                <FormField label="Joining date" error={errors.joiningDate}><input name="joiningDate" type="date" value={form.joiningDate} onChange={updateForm} aria-invalid={Boolean(errors.joiningDate)} /></FormField>
                <FormField label="Driver status"><select name="status" value={form.status} onChange={updateForm}>{driverStatuses.map((status) => <option key={status}>{status}</option>)}</select></FormField>
                <FormField label="Vehicle registration reference (optional)"><input name="vehicleRegistration" value={form.vehicleRegistration} onChange={updateForm} placeholder="Reference only; no assignment" /></FormField>
                <FormField label="Salary / daily payment rate (₹)" error={errors.paymentRate}><input name="paymentRate" type="number" min="0" step="0.01" value={form.paymentRate} onChange={updateForm} aria-invalid={Boolean(errors.paymentRate)} /></FormField>
              </FormSection>
              <FormSection title="Verification & documents">
                <FormField label="Aadhaar verification status"><select name="aadhaarStatus" value={form.aadhaarStatus} onChange={updateForm}>{verificationStatuses.map((status) => <option key={status}>{status}</option>)}</select></FormField>
                <FormField label="Police verification status"><select name="policeStatus" value={form.policeStatus} onChange={updateForm}>{verificationStatuses.map((status) => <option key={status}>{status}</option>)}</select></FormField>
                <FormField label="Medical fitness certificate expiry" error={errors.medicalExpiry}><input name="medicalExpiry" type="date" value={form.medicalExpiry} onChange={updateForm} aria-invalid={Boolean(errors.medicalExpiry)} /></FormField>
                <p className="driver-privacy-note">Demo verification statuses only. No Aadhaar number or identity document is collected.</p>
              </FormSection>
              <FormField label="Notes"><textarea name="notes" rows="3" value={form.notes} onChange={updateForm} /></FormField>
              <div className="booking-modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add driver'}</button></div>
            </form>
          </section>
        </div>
      )}

      {confirmation && (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirmation(null)}>
          <section className="booking-modal confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="driver-confirm-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><span className="eyebrow">{confirmation.type === 'delete' ? 'DELETE DRIVER' : 'CONFIRM STATUS CHANGE'}</span><h2 id="driver-confirm-title">{confirmation.type === 'delete' ? 'Remove this driver?' : 'Update driver status'}</h2></div><button className="icon-button" type="button" aria-label="Close confirmation" onClick={() => setConfirmation(null)}><X size={18} /></button></div>
            {confirmation.type === 'delete' ? <p className="confirmation-copy">This will remove {confirmation.driver.name} ({confirmation.driver.id}) from the demo roster. This action cannot be undone.</p> : <><p className="confirmation-copy">Choose the new availability status for {confirmation.driver.name}.</p><label className="driver-status-choice">New status<select aria-label="New driver status" value={confirmation.status} onChange={(event) => setConfirmation((current) => ({ ...current, status: event.target.value }))}>{driverStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></>}
            <div className="booking-modal-actions"><button type="button" className="secondary-button" onClick={() => setConfirmation(null)}>{confirmation.type === 'delete' ? 'Keep driver' : 'Cancel'}</button><button type="button" className={`primary-button ${confirmation.type === 'delete' ? 'destructive-confirm-button' : ''}`} disabled={confirmation.type === 'status' && confirmation.status === confirmation.driver.status} onClick={confirmation.type === 'delete' ? deleteDriver : applyStatus}>{confirmation.type === 'delete' ? 'Delete driver' : 'Confirm status'}</button></div>
          </section>
        </div>
      )}

      {verificationDriver && (
        <div className="modal-backdrop" role="presentation" onClick={() => setVerificationDriver(null)}>
          <section className="booking-modal confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="verification-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><span className="eyebrow">DEMO VERIFICATION</span><h2 id="verification-title">Update verification</h2></div><button className="icon-button" type="button" aria-label="Close verification dialog" onClick={() => setVerificationDriver(null)}><X size={18} /></button></div>
            <p className="confirmation-copy">Update mock verification statuses for {verificationDriver.name}. No identity numbers or documents are stored.</p>
            <label className="driver-status-choice">Aadhaar verification<select aria-label="Aadhaar verification status" value={verificationDriver.aadhaarStatus} onChange={(event) => setVerificationDriver((current) => ({ ...current, aadhaarStatus: event.target.value }))}>{verificationStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="driver-status-choice">Police verification<select aria-label="Police verification status" value={verificationDriver.policeStatus} onChange={(event) => setVerificationDriver((current) => ({ ...current, policeStatus: event.target.value }))}>{verificationStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <div className="booking-modal-actions"><button type="button" className="secondary-button" onClick={() => setVerificationDriver(null)}>Cancel</button><button type="button" className="primary-button" onClick={applyVerification}>Save verification</button></div>
          </section>
        </div>
      )}
    </>
  )
}

function SummaryCard({ label, value, tone }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong><small>Demo roster count</small></div>
}

function FilterControl({ label, value, options, onChange }) {
  return <label className="filter-select"><Filter size={14} /><select aria-label={label} value={value === allFilter && !options.includes(allFilter) ? options[0] : value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  const active = sortBy === sortKey
  return <button type="button" className={`vehicle-sort-button ${active ? 'vehicle-sort-active' : ''}`} aria-label={`Sort by ${children}`} aria-sort={active ? direction === 'asc' ? 'ascending' : 'descending' : 'none'} onClick={() => onClick(sortKey)}>{children}<ArrowUpDown size={12} /></button>
}

function FormSection({ title, children }) {
  return <fieldset className="driver-form-section"><legend>{title}</legend><div className="driver-form-grid">{children}</div></fieldset>
}

function FormField({ label, error, children }) {
  return <label className="vehicle-form-field"><span>{label}</span>{children}{error && <small className="field-error" role="alert">{error}</small>}</label>
}

function SummaryVerificationBadge({ status }) {
  const classes = { Verified: 'verification-verified', Pending: 'verification-pending', Rejected: 'verification-rejected' }
  return <span className={`verification-badge ${classes[status] || ''}`}>{status}</span>
}

function VerificationBadges({ driver }) {
  return <div className="verification-badges"><SummaryVerificationBadge status={driver.aadhaarStatus} /><SummaryVerificationBadge status={driver.policeStatus} /></div>
}

function ExpiryBadge({ value }) {
  const state = documentState(value)
  return <span className={`document-badge document-${state.state}`}>{state.label}</span>
}

function DetailSection({ title, children }) {
  return <section className="driver-detail-section"><h3>{title}</h3><div className="driver-detail-grid">{children}</div></section>
}

function DetailItem({ label, value }) {
  return <div className="driver-detail-item"><small>{label}</small><strong>{value || '—'}</strong></div>
}

function ExpiryDetail({ label, value }) {
  return <div className="driver-detail-item"><small>{label}</small><strong>{formatDate(value)}</strong><ExpiryBadge value={value} /></div>
}
