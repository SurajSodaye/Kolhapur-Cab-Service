import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, CarFront, Check, Download, Edit3, Eye, Filter, Plus, Search, Trash2, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import {
  mockVehicles,
  vehicleCategories,
  vehicleDocuments,
  vehicleFuelTypes,
  vehicleStatuses,
  vehicleTransmissions,
} from '../data/mockVehicles.js'
import {
  subscribeVehicles,
  saveVehicle as firestoreSaveVehicle,
  deleteVehicle as firestoreDeleteVehicle,
} from '../services/adminFirestoreService.js'

const pageSizeOptions = [10, 20, 50]

const emptyVehicle = {
  registration: '',
  name: '',
  brand: '',
  category: 'Sedan',
  fuel: 'Petrol',
  transmission: 'Manual',
  seating: '',
  luggage: 0,
  ac: true,
  status: 'Available',
  insuranceExpiry: '',
  pucExpiry: '',
  permitExpiry: '',
  fitnessExpiry: '',
  odometer: '',
  ratePerKm: '',
  baseFare: '',
  notes: '',
}

const filterOptions = {
  status: ['All statuses', ...vehicleStatuses],
  category: ['All categories', ...vehicleCategories],
  fuel: ['All fuel types', ...vehicleFuelTypes],
  ac: ['AC and non-AC', 'AC', 'Non-AC'],
}

const sortOptions = [
  { key: 'registration', label: 'Registration' },
  { key: 'name', label: 'Vehicle name' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'ratePerKm', label: 'Rate / km' },
]

function normalizeRegistration(value) {
  return value.toUpperCase().replace(/[\s-]/g, '')
}

function displayRegistration(value) {
  const normalized = normalizeRegistration(value)
  const match = /^([A-Z]{2})(\d{2})([A-Z]{1,3})(\d{4})$/.exec(normalized)
  return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : value
}

function isValidRegistration(value) {
  return /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/.test(normalizeRegistration(value))
}

function documentState(dateValue) {
  if (!dateValue) return { state: 'missing', label: 'Date not set' }
  const [year, month, day] = dateValue.split('-').map(Number)
  const expiry = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
  if (daysRemaining < 0) return { state: 'expired', label: 'Expired' }
  if (daysRemaining <= 30) return { state: 'soon', label: daysRemaining === 0 ? 'Expires today' : `Expires in ${daysRemaining}d` }
  return { state: 'valid', label: 'Valid' }
}

function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day))
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(mockVehicles)

  // Subscribe to real-time Firestore vehicles
  useEffect(() => {
    const unsubscribe = subscribeVehicles((firestoreVehicles) => {
      if (firestoreVehicles && firestoreVehicles.length > 0) {
        setVehicles(firestoreVehicles)
      }
    })
    return () => unsubscribe()
  }, [])
  const vehicleSequence = useRef(mockVehicles.reduce((max, vehicle) => {
    const match = /^VEH-(\d+)$/.exec(vehicle.id)
    return match ? Math.max(max, Number(match[1])) : max
  }, 1000) + 1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [fuelFilter, setFuelFilter] = useState('All fuel types')
  const [acFilter, setAcFilter] = useState('AC and non-AC')
  const [sortBy, setSortBy] = useState('registration')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyVehicle)
  const [formErrors, setFormErrors] = useState({})
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [toast, setToast] = useState('')

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const result = vehicles.filter((vehicle) => {
      const matchesSearch = !normalizedSearch || [
        vehicle.id, vehicle.registration, vehicle.name, vehicle.brand,
      ].some((value) => value.toLowerCase().includes(normalizedSearch))
      const matchesStatus = statusFilter === 'All statuses' || vehicle.status === statusFilter
      const matchesCategory = categoryFilter === 'All categories' || vehicle.category === categoryFilter
      const matchesFuel = fuelFilter === 'All fuel types' || vehicle.fuel === fuelFilter
      const matchesAc = acFilter === 'AC and non-AC' || (acFilter === 'AC' ? vehicle.ac : !vehicle.ac)
      return matchesSearch && matchesStatus && matchesCategory && matchesFuel && matchesAc
    })

    return result.sort((first, second) => {
      const firstValue = first[sortBy]
      const secondValue = second[sortBy]
      const comparison = typeof firstValue === 'number'
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), 'en', { sensitivity: 'base' })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [acFilter, categoryFilter, fuelFilter, search, sortBy, sortDirection, statusFilter, vehicles])

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageVehicles = filteredVehicles.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const summary = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter((vehicle) => vehicle.status === 'Available').length,
    onTrip: vehicles.filter((vehicle) => vehicle.status === 'On Trip').length,
    maintenance: vehicles.filter((vehicle) => vehicle.status === 'Maintenance').length,
    inactive: vehicles.filter((vehicle) => vehicle.status === 'Inactive').length,
  }), [vehicles])

  const announce = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All statuses')
    setCategoryFilter('All categories')
    setFuelFilter('All fuel types')
    setAcFilter('AC and non-AC')
    setPage(1)
  }

  const changeSort = (key) => {
    if (sortBy === key) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')
    else {
      setSortBy(key)
      setSortDirection('asc')
    }
    setPage(1)
  }

  const openAddForm = () => {
    setEditingId('')
    setForm({ ...emptyVehicle })
    setFormErrors({})
    setFormOpen(true)
  }

  const openEditForm = (vehicle) => {
    setEditingId(vehicle.id)
    setForm({
      ...vehicle,
      registration: displayRegistration(vehicle.registration),
      ac: Boolean(vehicle.ac),
    })
    setFormErrors({})
    setSelectedVehicle(null)
    setFormOpen(true)
  }

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyVehicle })
    setFormErrors({})
  }, [])

  useEffect(() => {
    if (!(formOpen || selectedVehicle || pendingStatus || pendingDelete)) return undefined
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return
      if (pendingDelete) setPendingDelete(null)
      else if (pendingStatus) setPendingStatus(null)
      else if (formOpen) closeForm()
      else setSelectedVehicle(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [closeForm, formOpen, pendingDelete, pendingStatus, selectedVehicle])

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox'
        ? checked
        : ['seating', 'luggage', 'odometer', 'ratePerKm', 'baseFare'].includes(name)
          ? (value === '' ? '' : Number(value))
          : value,
    }))
    setFormErrors((current) => ({ ...current, [name]: '' }))
  }

  const saveVehicle = (event) => {
    event.preventDefault()
    const errors = {}
    const normalizedRegistration = normalizeRegistration(form.registration)
    const duplicate = vehicles.some((vehicle) => (
      vehicle.id !== editingId && normalizeRegistration(vehicle.registration) === normalizedRegistration
    ))

    if (!form.registration.trim()) errors.registration = 'Enter the vehicle registration number.'
    else if (!isValidRegistration(form.registration)) errors.registration = 'Use a valid Indian registration, e.g. MH 09 AB 2381.'
    else if (duplicate) errors.registration = 'This registration number is already assigned to another vehicle.'
    if (!form.name.trim()) errors.name = 'Enter the vehicle name or model.'
    if (!form.brand.trim()) errors.brand = 'Enter the vehicle manufacturer.'
    if (!form.seating || !Number.isInteger(Number(form.seating)) || Number(form.seating) < 1) {
      errors.seating = 'Seating capacity must be a positive whole number.'
    }
    for (const [field, label] of [['luggage', 'Luggage capacity'], ['odometer', 'Odometer']]) {
      if (form[field] === '' || !Number.isFinite(Number(form[field])) || Number(form[field]) < 0) {
        errors[field] = `${label} must be a non-negative number.`
      }
    }
    for (const [field, label] of [['ratePerKm', 'Per-kilometre rate'], ['baseFare', 'Base fare']]) {
      if (form[field] === '' || !Number.isFinite(Number(form[field])) || Number(form[field]) < 0) {
        errors[field] = `${label} must be a valid non-negative amount.`
      }
    }
    for (const document of vehicleDocuments) {
      if (!form[document.key]) errors[document.key] = `${document.label} is required.`
      else if (Number.isNaN(Date.parse(`${form[document.key]}T00:00:00`))) errors[document.key] = 'Enter a valid expiry date.'
    }
    setFormErrors(errors)
    if (Object.keys(errors).length) return

    const existingIds = new Set(vehicles.map((vehicle) => vehicle.id))
    while (!editingId && existingIds.has(`VEH-${vehicleSequence.current}`)) vehicleSequence.current += 1
    const generatedId = editingId || `VEH-${vehicleSequence.current++}`
    const savedVehicle = {
      ...form,
      id: generatedId,
      registration: displayRegistration(normalizedRegistration),
      name: form.name.trim(),
      brand: form.brand.trim(),
      notes: form.notes.trim(),
      seating: Number(form.seating),
      luggage: Number(form.luggage),
      odometer: Number(form.odometer),
      ratePerKm: Number(form.ratePerKm),
      baseFare: Number(form.baseFare),
    }

    setVehicles((current) => editingId
      ? current.map((vehicle) => vehicle.id === editingId ? savedVehicle : vehicle)
      : [savedVehicle, ...current])
    firestoreSaveVehicle(savedVehicle).catch((err) => console.warn('Firestore vehicle save error:', err))
    closeForm()
    announce(editingId ? 'Vehicle details updated.' : `Vehicle ${savedVehicle.id} added successfully.`)
  }

  const confirmStatusChange = () => {
    if (!pendingStatus) return
    const updated = { ...pendingStatus.vehicle, status: pendingStatus.status }
    setVehicles((current) => current.map((vehicle) => (
      vehicle.id === pendingStatus.vehicle.id
        ? updated
        : vehicle
    )))
    firestoreSaveVehicle(updated).catch((err) => console.warn('Firestore vehicle status error:', err))
    announce(`${pendingStatus.vehicle.name} status changed to ${pendingStatus.status}.`)
    setPendingStatus(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const deletedId = pendingDelete.id
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== deletedId))
    firestoreDeleteVehicle(deletedId).catch((err) => console.warn('Firestore vehicle delete error:', err))
    setPage((current) => Math.max(1, Math.min(current, Math.ceil(Math.max(0, filteredVehicles.length - 1) / pageSize))))
    announce(`${pendingDelete.name} was deleted.`)
    setPendingDelete(null)
  }

  const exportCsv = () => {
    const headers = [
      'Vehicle ID', 'Registration', 'Vehicle name', 'Brand', 'Category', 'Fuel', 'Transmission',
      'Seating', 'Luggage capacity', 'AC', 'Status', 'Insurance expiry', 'PUC expiry', 'Permit expiry',
      'Registration / fitness expiry', 'Odometer', 'Rate per km', 'Base fare', 'Notes',
    ]
    const rows = filteredVehicles.map((vehicle) => [
      vehicle.id, vehicle.registration, vehicle.name, vehicle.brand, vehicle.category, vehicle.fuel,
      vehicle.transmission, vehicle.seating, vehicle.luggage, vehicle.ac ? 'Yes' : 'No', vehicle.status,
      vehicle.insuranceExpiry, vehicle.pucExpiry, vehicle.permitExpiry, vehicle.fitnessExpiry,
      vehicle.odometer, vehicle.ratePerKm, vehicle.baseFare, vehicle.notes,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'vehicles-export.csv'
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <>
      <PageHeader title="Vehicles" description="Manage your cab fleet and vehicle availability.">
        <div className="vehicle-page-actions">
          <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
          <button type="button" className="primary-button" onClick={openAddForm}><Plus size={14} />Add Vehicle</button>
        </div>
      </PageHeader>

      <div className="demo-banner">
        <span className="demo-banner-mark">i</span>
        <span><strong>Demo fleet</strong> — vehicle records and document dates are sample data for interface preview only.</span>
      </div>

      <section className="vehicle-summary-grid" aria-label="Fleet overview">
        <SummaryCard label="Total Vehicles" value={summary.total} tone="blue" />
        <SummaryCard label="Available" value={summary.available} tone="green" />
        <SummaryCard label="On Trip" value={summary.onTrip} tone="violet" />
        <SummaryCard label="Maintenance" value={summary.maintenance} tone="amber" />
        <SummaryCard label="Inactive" value={summary.inactive} tone="slate" />
      </section>

      {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

      <section className="panel vehicle-management-panel">
        <div className="panel-heading vehicle-panel-heading">
          <div><h2>Fleet vehicles</h2><p>Search, filter, sort, and maintain your fleet.</p></div>
          <span className="vehicle-result-count">{filteredVehicles.length} vehicles</span>
        </div>
        <div className="vehicle-filters">
          <label className="search-field">
            <Search size={15} />
            <input aria-label="Search vehicles" type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search registration, model, brand or ID..." />
          </label>
          <FilterControl label="Filter by status" value={statusFilter} options={filterOptions.status} onChange={(value) => { setStatusFilter(value); setPage(1) }} />
          <FilterControl label="Filter by category" value={categoryFilter} options={filterOptions.category} onChange={(value) => { setCategoryFilter(value); setPage(1) }} />
          <FilterControl label="Filter by fuel" value={fuelFilter} options={filterOptions.fuel} onChange={(value) => { setFuelFilter(value); setPage(1) }} />
          <FilterControl label="Filter by AC availability" value={acFilter} options={filterOptions.ac} onChange={(value) => { setAcFilter(value); setPage(1) }} />
          <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear all filters</button>
        </div>

        <div className="table-scroll vehicle-table-scroll">
          <table className="data-table vehicle-table">
            <thead>
              <tr>
                <th><SortButton sortKey="name" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Vehicle</SortButton></th>
                <th><SortButton sortKey="registration" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Registration number</SortButton></th>
                <th><SortButton sortKey="category" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Category</SortButton></th>
                <th>Fuel</th>
                <th>Seats</th>
                <th>AC</th>
                <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Status</SortButton></th>
                <th><SortButton sortKey="ratePerKm" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Rate / km</SortButton></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageVehicles.length ? pageVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="vehicle-identity">
                      <span className="vehicle-thumb"><CarFront size={18} /></span>
                      <span><strong>{vehicle.name}</strong><small>{vehicle.brand} · {vehicle.id}</small></span>
                    </div>
                  </td>
                  <td className="vehicle-registration">{vehicle.registration}</td>
                  <td>{vehicle.category}</td>
                  <td>{vehicle.fuel}</td>
                  <td>{vehicle.seating}</td>
                  <td>{vehicle.ac ? 'Yes' : 'No'}</td>
                  <td><StatusBadge status={vehicle.status} /></td>
                  <td className="fare-cell">{formatMoney(vehicle.ratePerKm)}</td>
                  <td className="vehicle-actions-cell">
                    <button className="table-action-button" type="button" aria-label={`View ${vehicle.id}`} onClick={() => setSelectedVehicle(vehicle)}><Eye size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Edit ${vehicle.id}`} onClick={() => openEditForm(vehicle)}><Edit3 size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Change status for ${vehicle.id}`} onClick={() => setPendingStatus({ vehicle, status: vehicle.status })}><ArrowUpDown size={15} /></button>
                    <button className="table-action-button danger-button" type="button" aria-label={`Delete ${vehicle.id}`} onClick={() => setPendingDelete(vehicle)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9"><div className="empty-state vehicle-empty-state"><CarFront size={20} /><strong>No vehicles found</strong><span>Try adjusting your search or filters, or clear all filters.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row vehicle-pagination">
          <label className="page-size-control">Rows per page
            <select aria-label="Vehicles rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>
              {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <span className="pagination-count">{filteredVehicles.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredVehicles.length)} of ${filteredVehicles.length}` : '0 vehicles'}</span>
          <button type="button" className="secondary-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" className="secondary-button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </section>

      {selectedVehicle && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedVehicle(null)}>
          <section className="vehicle-details-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-details-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><span className="eyebrow">VEHICLE DETAILS · {selectedVehicle.id}</span><h2 id="vehicle-details-title">{selectedVehicle.name}</h2><p className="vehicle-detail-subtitle">{selectedVehicle.brand} · {selectedVehicle.registration}</p></div>
              <button className="icon-button" type="button" aria-label="Close vehicle details" onClick={() => setSelectedVehicle(null)}><X size={18} /></button>
            </div>
            <div className="vehicle-detail-status"><StatusBadge status={selectedVehicle.status} /></div>
            <DetailSection title="Specifications">
              <DetailItem label="Category" value={selectedVehicle.category} />
              <DetailItem label="Fuel type" value={selectedVehicle.fuel} />
              <DetailItem label="Transmission" value={selectedVehicle.transmission} />
              <DetailItem label="Seating" value={`${selectedVehicle.seating} passengers`} />
              <DetailItem label="Luggage capacity" value={`${selectedVehicle.luggage} bags`} />
              <DetailItem label="Air conditioning" value={selectedVehicle.ac ? 'Available' : 'Not available'} />
              <DetailItem label="Odometer" value={`${Number(selectedVehicle.odometer).toLocaleString('en-IN')} km`} />
            </DetailSection>
            <DetailSection title="Documents">
              {vehicleDocuments.map((document) => <DocumentItem key={document.key} document={document} date={selectedVehicle[document.key]} />)}
            </DetailSection>
            <DetailSection title="Pricing">
              <DetailItem label="Per-kilometre rate" value={`${formatMoney(selectedVehicle.ratePerKm)} / km`} />
              <DetailItem label="Base fare" value={formatMoney(selectedVehicle.baseFare)} />
            </DetailSection>
            <div className="vehicle-notes"><strong>Notes</strong><p>{selectedVehicle.notes || 'No notes added.'}</p></div>
            <div className="booking-modal-actions">
              <button type="button" className="secondary-button" onClick={() => openEditForm(selectedVehicle)}>Edit vehicle</button>
              <button type="button" className="primary-button" onClick={() => setSelectedVehicle(null)}>Done</button>
            </div>
          </section>
        </div>
      )}

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeForm}>
          <section className="vehicle-form-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-form-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div><span className="eyebrow">{editingId ? 'EDIT VEHICLE' : 'NEW VEHICLE'}</span><h2 id="vehicle-form-title">{editingId ? 'Update vehicle' : 'Add vehicle'}</h2></div>
              <button className="icon-button" type="button" aria-label="Close vehicle form" onClick={closeForm}><X size={18} /></button>
            </div>
            <form className="vehicle-form" noValidate onSubmit={saveVehicle}>
              <div className="vehicle-form-grid">
                <FormField label="Registration number" error={formErrors.registration}>
                  <input name="registration" value={form.registration} onChange={updateForm} required placeholder="MH 09 AB 2381" aria-invalid={Boolean(formErrors.registration)} />
                </FormField>
                <FormField label="Vehicle name / model" error={formErrors.name}>
                  <input name="name" value={form.name} onChange={updateForm} required placeholder="e.g. Dzire VXI" aria-invalid={Boolean(formErrors.name)} />
                </FormField>
                <FormField label="Brand / manufacturer" error={formErrors.brand}>
                  <input name="brand" value={form.brand} onChange={updateForm} required placeholder="e.g. Maruti Suzuki" aria-invalid={Boolean(formErrors.brand)} />
                </FormField>
                <FormField label="Category">
                  <select name="category" value={form.category} onChange={updateForm}>{vehicleCategories.map((item) => <option key={item}>{item}</option>)}</select>
                </FormField>
                <FormField label="Fuel type">
                  <select name="fuel" value={form.fuel} onChange={updateForm}>{vehicleFuelTypes.map((item) => <option key={item}>{item}</option>)}</select>
                </FormField>
                <FormField label="Transmission">
                  <select name="transmission" value={form.transmission} onChange={updateForm}>{vehicleTransmissions.map((item) => <option key={item}>{item}</option>)}</select>
                </FormField>
                <FormField label="Seating capacity" error={formErrors.seating}>
                  <input name="seating" type="number" min="1" step="1" value={form.seating} onChange={updateForm} required aria-invalid={Boolean(formErrors.seating)} />
                </FormField>
                <FormField label="Luggage capacity (bags)" error={formErrors.luggage}>
                  <input name="luggage" type="number" min="0" step="1" value={form.luggage} onChange={updateForm} required aria-invalid={Boolean(formErrors.luggage)} />
                </FormField>
                <FormField label="Current status">
                  <select name="status" value={form.status} onChange={updateForm}>{vehicleStatuses.map((item) => <option key={item}>{item}</option>)}</select>
                </FormField>
                <FormField label="Current odometer (km)" error={formErrors.odometer}>
                  <input name="odometer" type="number" min="0" step="1" value={form.odometer} onChange={updateForm} required aria-invalid={Boolean(formErrors.odometer)} />
                </FormField>
                <FormField label="Per-kilometre rate (₹)" error={formErrors.ratePerKm}>
                  <input name="ratePerKm" type="number" min="0" step="0.01" value={form.ratePerKm} onChange={updateForm} required aria-invalid={Boolean(formErrors.ratePerKm)} />
                </FormField>
                <FormField label="Base fare (₹)" error={formErrors.baseFare}>
                  <input name="baseFare" type="number" min="0" step="0.01" value={form.baseFare} onChange={updateForm} required aria-invalid={Boolean(formErrors.baseFare)} />
                </FormField>
                {vehicleDocuments.map((document) => (
                  <FormField key={document.key} label={document.label} error={formErrors[document.key]}>
                    <input name={document.key} type="date" value={form[document.key]} onChange={updateForm} required aria-invalid={Boolean(formErrors[document.key])} />
                  </FormField>
                ))}
                <label className="vehicle-ac-control"><input name="ac" type="checkbox" checked={form.ac} onChange={updateForm} /><span>Air conditioning available</span></label>
              </div>
              <FormField label="Notes">
                <textarea name="notes" rows="3" value={form.notes} onChange={updateForm} placeholder="Vehicle notes or service reminders" />
              </FormField>
              <div className="booking-modal-actions">
                <button type="button" className="secondary-button" onClick={closeForm}>Cancel</button>
                <button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add vehicle'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingStatus && (
        <div className="modal-backdrop" role="presentation" onClick={() => setPendingStatus(null)}>
          <section className="booking-modal confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="vehicle-status-confirm-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><span className="eyebrow">CONFIRM STATUS CHANGE</span><h2 id="vehicle-status-confirm-title">Update vehicle status</h2></div><button className="icon-button" type="button" aria-label="Close confirmation" onClick={() => setPendingStatus(null)}><X size={18} /></button></div>
            <p className="confirmation-copy">Set {pendingStatus.vehicle.name} ({pendingStatus.vehicle.registration}) to:</p>
            <label className="vehicle-status-choice">New status
              <select aria-label="New vehicle status" value={pendingStatus.status} onChange={(event) => setPendingStatus((current) => ({ ...current, status: event.target.value }))}>
                {vehicleStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <div className="booking-modal-actions">
              <button className="secondary-button" type="button" onClick={() => setPendingStatus(null)}>Cancel</button>
              <button className="primary-button" type="button" disabled={pendingStatus.status === pendingStatus.vehicle.status} onClick={confirmStatusChange}>Confirm status</button>
            </div>
          </section>
        </div>
      )}

      {pendingDelete && (
        <div className="modal-backdrop" role="presentation" onClick={() => setPendingDelete(null)}>
          <section className="booking-modal confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="vehicle-delete-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><span className="eyebrow">DELETE VEHICLE</span><h2 id="vehicle-delete-title">Remove this vehicle?</h2></div><button className="icon-button" type="button" aria-label="Close delete confirmation" onClick={() => setPendingDelete(null)}><X size={18} /></button></div>
            <p className="confirmation-copy">This will remove {pendingDelete.name} ({pendingDelete.registration}) from the demo fleet. This action cannot be undone.</p>
            <div className="booking-modal-actions">
              <button className="secondary-button" type="button" onClick={() => setPendingDelete(null)}>Keep vehicle</button>
              <button className="primary-button destructive-confirm-button" type="button" onClick={confirmDelete}>Delete vehicle</button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

function SummaryCard({ label, value, tone }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong><small>Demo fleet count</small></div>
}

function FilterControl({ label, value, options, onChange }) {
  return (
    <label className="filter-select">
      <Filter size={14} />
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  const active = sortBy === sortKey
  return (
    <button className={`vehicle-sort-button ${active ? 'vehicle-sort-active' : ''}`} type="button" onClick={() => onClick(sortKey)} aria-label={`Sort by ${children}`} aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
      {children}<ArrowUpDown size={12} />
    </button>
  )
}

function FormField({ label, error, children }) {
  return <label className="vehicle-form-field"><span>{label}</span>{children}{error && <small className="field-error" role="alert">{error}</small>}</label>
}

function DetailSection({ title, children }) {
  return <section className="vehicle-detail-section"><h3>{title}</h3><div className="vehicle-detail-grid">{children}</div></section>
}

function DetailItem({ label, value }) {
  return <div className="vehicle-detail-item"><small>{label}</small><strong>{value || '—'}</strong></div>
}

function DocumentItem({ document, date }) {
  const state = documentState(date)
  return (
    <div className="vehicle-detail-item vehicle-document-item">
      <small>{document.label}</small>
      <strong>{formatDate(date)}</strong>
      <DocumentBadge state={state} />
    </div>
  )
}

function DocumentBadge({ state }) {
  return <span className={`document-badge document-${state.state}`}><i />{state.label}</span>
}
