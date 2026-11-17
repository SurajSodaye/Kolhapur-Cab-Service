import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, Download, Edit3, Eye, Filter, MapPin, Plus, Route as RouteIcon, Search, Trash2, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import { mockRoutes, routeStatuses, routeTypes, routeVehicleCategories } from '../data/mockRoutes.js'
import {
  subscribeRoutes,
  saveRoute as firestoreSaveRoute,
  deleteRoute as firestoreDeleteRoute,
} from '../services/adminFirestoreService.js'

const pageSizes = [10, 20, 50]
const emptyRoute = {
  name: '',
  origin: '',
  destination: '',
  stopsText: '',
  type: '',
  distanceKm: '',
  durationHours: '',
  oneWay: true,
  roundTrip: true,
  tollEstimate: 0,
  baseFare: '',
  perKmRate: '',
  minimumFare: '',
  vehicleCategories: [],
  status: 'Active',
  description: '',
  notes: '',
}

function normalizePlace(value) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function formatDuration(hours) {
  const totalMinutes = Math.round(Number(hours) * 60)
  const hourPart = Math.floor(totalMinutes / 60)
  const minutePart = totalMinutes % 60
  if (!hourPart) return `${minutePart} min`
  return minutePart ? `${hourPart} hr ${minutePart} min` : `${hourPart} hr`
}

function estimateFare(route) {
  return Math.max(
    Number(route.minimumFare) || 0,
    (Number(route.baseFare) || 0) + (Number(route.distanceKm) || 0) * (Number(route.perKmRate) || 0) + (Number(route.tollEstimate) || 0),
  )
}

function saveCsv(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'routes-export.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState(mockRoutes)

  // Subscribe to real-time Firestore routes
  useEffect(() => {
    const unsubscribe = subscribeRoutes((firestoreRoutes) => {
      if (firestoreRoutes && firestoreRoutes.length > 0) {
        setRoutes(firestoreRoutes)
      }
    })
    return () => unsubscribe()
  }, [])
  const sequence = useRef(mockRoutes.reduce((highest, route) => {
    const match = /^RT-(\d+)$/.exec(route.id)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 1000) + 1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [typeFilter, setTypeFilter] = useState('All route types')
  const [oneWayFilter, setOneWayFilter] = useState('All')
  const [roundTripFilter, setRoundTripFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyRoute)
  const [errors, setErrors] = useState({})
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [toast, setToast] = useState('')

  const filteredRoutes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const filtered = routes.filter((route) => {
      const matchesSearch = !query || [route.id, route.name, route.origin, route.destination]
        .some((value) => value.toLocaleLowerCase().includes(query))
      const matchesStatus = statusFilter === 'All statuses' || route.status === statusFilter
      const matchesType = typeFilter === 'All route types' || route.type === typeFilter
      const matchesOneWay = oneWayFilter === 'All' || route.oneWay === (oneWayFilter === 'Enabled')
      const matchesRoundTrip = roundTripFilter === 'All' || route.roundTrip === (roundTripFilter === 'Enabled')
      const matchesCategory = categoryFilter === 'All categories' || route.vehicleCategories.includes(categoryFilter)
      return matchesSearch && matchesStatus && matchesType && matchesOneWay && matchesRoundTrip && matchesCategory
    })

    return filtered.sort((first, second) => {
      const firstValue = first[sortBy]
      const secondValue = second[sortBy]
      const comparison = typeof firstValue === 'number'
        ? firstValue - secondValue
        : String(firstValue).localeCompare(String(secondValue), 'en', { sensitivity: 'base' })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [categoryFilter, oneWayFilter, roundTripFilter, routes, search, sortBy, sortDirection, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRoutes = filteredRoutes.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const summary = useMemo(() => ({
    total: routes.length,
    active: routes.filter((route) => route.status === 'Active').length,
    inactive: routes.filter((route) => route.status === 'Inactive').length,
    oneWay: routes.filter((route) => route.oneWay).length,
    roundTrip: routes.filter((route) => route.roundTrip).length,
  }), [routes])

  useEffect(() => {
    const hasOpenDialog = formOpen || selectedRoute || statusConfirmation || deleteConfirmation
    if (!hasOpenDialog) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFormOpen(false)
        setSelectedRoute(null)
        setStatusConfirmation(null)
        setDeleteConfirmation(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleteConfirmation, formOpen, selectedRoute, statusConfirmation])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All statuses')
    setTypeFilter('All route types')
    setOneWayFilter('All')
    setRoundTripFilter('All')
    setCategoryFilter('All categories')
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
    setForm({ ...emptyRoute })
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (route) => {
    setEditingId(route.id)
    setForm({
      ...route,
      stopsText: route.stops.join(', '),
      vehicleCategories: [...route.vehicleCategories],
    })
    setErrors({})
    setSelectedRoute(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyRoute })
    setErrors({})
  }

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox'
        ? checked
        : ['distanceKm', 'durationHours', 'tollEstimate', 'baseFare', 'perKmRate', 'minimumFare'].includes(name)
          ? (value === '' ? '' : Number(value))
          : value,
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const toggleCategory = (category) => {
    setForm((current) => ({
      ...current,
      vehicleCategories: current.vehicleCategories.includes(category)
        ? current.vehicleCategories.filter((item) => item !== category)
        : [...current.vehicleCategories, category],
    }))
    setErrors((current) => ({ ...current, vehicleCategories: '' }))
  }

  const submitForm = (event) => {
    event.preventDefault()
    const validation = {}
    const origin = form.origin.trim()
    const destination = form.destination.trim()
    const hasDuplicate = routes.some((route) => (
      route.id !== editingId
      && normalizePlace(route.origin) === normalizePlace(origin)
      && normalizePlace(route.destination) === normalizePlace(destination)
    ))

    if (!form.name.trim()) validation.name = 'Enter a route name.'
    if (!origin) validation.origin = 'Enter an origin city.'
    if (!destination) validation.destination = 'Enter a destination city.'
    else if (origin && normalizePlace(origin) === normalizePlace(destination)) validation.destination = 'Origin and destination must be different.'
    if (origin && destination && normalizePlace(origin) !== normalizePlace(destination) && hasDuplicate) {
      validation.destination = 'A route with this origin and destination already exists.'
    }
    if (!routeTypes.includes(form.type)) validation.type = 'Select a route type.'
    if (form.distanceKm === '' || !Number.isFinite(Number(form.distanceKm)) || Number(form.distanceKm) <= 0) validation.distanceKm = 'Distance must be greater than zero.'
    if (form.durationHours === '' || !Number.isFinite(Number(form.durationHours)) || Number(form.durationHours) <= 0) validation.durationHours = 'Duration must be greater than zero.'
    for (const field of ['tollEstimate', 'baseFare', 'perKmRate', 'minimumFare']) {
      if (form[field] === '' || !Number.isFinite(Number(form[field])) || Number(form[field]) < 0) {
        validation[field] = 'Enter a non-negative amount.'
      }
    }
    if (!form.oneWay && !form.roundTrip) validation.availability = 'Enable one-way or round-trip availability.'
    if (!form.vehicleCategories.length) validation.vehicleCategories = 'Select at least one vehicle category.'
    if (!routeStatuses.includes(form.status)) validation.status = 'Select a route status.'

    setErrors(validation)
    if (Object.keys(validation).length) return

    const savedRoute = {
      ...form,
      id: editingId || `RT-${sequence.current++}`,
      name: form.name.trim(),
      origin,
      destination,
      stops: form.stopsText.split(',').map((stop) => stop.trim()).filter(Boolean),
      distanceKm: Number(form.distanceKm),
      durationHours: Number(form.durationHours),
      tollEstimate: Number(form.tollEstimate),
      baseFare: Number(form.baseFare),
      perKmRate: Number(form.perKmRate),
      minimumFare: Number(form.minimumFare),
      vehicleCategories: [...form.vehicleCategories],
      description: form.description.trim(),
      notes: form.notes.trim(),
    }

    setRoutes((current) => editingId
      ? current.map((route) => route.id === editingId ? savedRoute : route)
      : [savedRoute, ...current])
    firestoreSaveRoute(savedRoute).catch((err) => console.warn('Firestore route save error:', err))
    closeForm()
    setPage(1)
    notify(editingId ? 'Route updated successfully.' : `${savedRoute.name} added successfully.`)
  }

  const applyStatus = () => {
    if (!statusConfirmation) return
    const updated = { ...statusConfirmation.route, status: statusConfirmation.status }
    setRoutes((current) => current.map((route) => (
      route.id === statusConfirmation.route.id ? updated : route
    )))
    firestoreSaveRoute(updated).catch((err) => console.warn('Firestore route status error:', err))
    notify(`${statusConfirmation.route.name} marked ${statusConfirmation.status.toLowerCase()}.`)
    setStatusConfirmation(null)
  }

  const deleteRoute = () => {
    if (!deleteConfirmation) return
    const deletedName = deleteConfirmation.name
    setRoutes((current) => current.filter((route) => route.id !== deleteConfirmation.id))
    firestoreDeleteRoute(deleteConfirmation.id).catch((err) => console.warn('Firestore route delete error:', err))
    setPage((current) => Math.max(1, Math.min(current, Math.ceil(Math.max(0, filteredRoutes.length - 1) / pageSize))))
    setDeleteConfirmation(null)
    notify(`${deletedName} deleted.`)
  }

  const exportCsv = () => {
    const headers = [
      'Route ID', 'Route name', 'Origin', 'Destination', 'Intermediate stops', 'Distance (km)',
      'Estimated duration (hours)', 'Route type', 'One-way available', 'Round-trip available',
      'Toll estimate', 'Base fare', 'Per-kilometre rate', 'Minimum fare', 'Vehicle categories',
      'Status', 'Description', 'Notes',
    ]
    const rows = filteredRoutes.map((route) => [
      route.id, route.name, route.origin, route.destination, route.stops.join(', '), route.distanceKm,
      route.durationHours, route.type, route.oneWay ? 'Yes' : 'No', route.roundTrip ? 'Yes' : 'No',
      route.tollEstimate, route.baseFare, route.perKmRate, route.minimumFare,
      route.vehicleCategories.join(', '), route.status, route.description, route.notes,
    ])
    saveCsv([headers, ...rows])
  }

  return (
    <>
      <PageHeader title="Routes" description="Manage popular travel routes, distances and pricing.">
        <div className="routes-page-actions">
          <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
          <button type="button" className="primary-button" onClick={openAddForm}><Plus size={14} />Add Route</button>
        </div>
      </PageHeader>

      <div className="demo-banner">
        <span className="demo-banner-mark">i</span>
        <span><strong>Demo route data</strong> — distances, durations and fares are illustrative only, not verified navigation estimates or customer quotations.</span>
      </div>

      <section className="routes-summary-grid" aria-label="Route overview">
        <SummaryCard label="Total Routes" value={summary.total} tone="blue" />
        <SummaryCard label="Active Routes" value={summary.active} tone="green" />
        <SummaryCard label="Inactive Routes" value={summary.inactive} tone="slate" />
        <SummaryCard label="One-way Routes" value={summary.oneWay} tone="violet" />
        <SummaryCard label="Round-trip Routes" value={summary.roundTrip} tone="amber" />
      </section>

      {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

      <section className="panel routes-management-panel">
        <div className="panel-heading routes-panel-heading">
          <div><h2>Route directory</h2><p>Search, filter, sort and maintain your route list.</p></div>
          <span className="vehicle-result-count">{filteredRoutes.length} routes</span>
        </div>
        <div className="routes-filters">
          <label className="search-field"><Search size={15} /><input type="search" aria-label="Search routes" placeholder="Search ID, route, origin or destination..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
          <FilterControl label="Filter by route status" value={statusFilter} options={['All statuses', ...routeStatuses]} onChange={(value) => { setStatusFilter(value); setPage(1) }} />
          <FilterControl label="Filter by route type" value={typeFilter} options={['All route types', ...routeTypes]} onChange={(value) => { setTypeFilter(value); setPage(1) }} />
          <FilterControl label="Filter by one-way availability" value={oneWayFilter} options={['All', 'Enabled', 'Disabled']} onChange={(value) => { setOneWayFilter(value); setPage(1) }} />
          <FilterControl label="Filter by round-trip availability" value={roundTripFilter} options={['All', 'Enabled', 'Disabled']} onChange={(value) => { setRoundTripFilter(value); setPage(1) }} />
          <FilterControl label="Filter by vehicle category" value={categoryFilter} options={['All categories', ...routeVehicleCategories]} onChange={(value) => { setCategoryFilter(value); setPage(1) }} />
          <label className="filter-select"><ArrowUpDown size={14} /><select aria-label="Sort routes by" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setSortDirection('asc'); setPage(1) }}><option value="name">Route name</option><option value="origin">Origin</option><option value="destination">Destination</option><option value="distanceKm">Distance</option><option value="baseFare">Base fare</option><option value="status">Status</option></select></label>
          <button type="button" className="secondary-button routes-sort-direction" aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`} onClick={() => { setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
          <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear All Filters</button>
        </div>

        <div className="table-scroll routes-table-scroll">
          <table className="data-table routes-table">
            <thead><tr>
              <th>Route ID</th>
              <th><SortButton sortKey="name" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Route</SortButton></th>
              <th><SortButton sortKey="type" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Route type</SortButton></th>
              <th><SortButton sortKey="distanceKm" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Distance</SortButton></th>
              <th>Duration</th>
              <th>Vehicle categories</th>
              <th><SortButton sortKey="baseFare" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Base fare</SortButton></th>
              <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Status</SortButton></th>
              <th>Actions</th>
            </tr></thead>
            <tbody>
              {pageRoutes.length ? pageRoutes.map((route) => (
                <tr key={route.id}>
                  <td className="route-id-cell">{route.id}</td>
                  <td><div className="route-name-cell"><strong>{route.name}</strong><small>{route.origin} <span aria-hidden="true">→</span> {route.destination}</small></div></td>
                  <td>{route.type}</td>
                  <td>{Number(route.distanceKm).toLocaleString('en-IN')} km</td>
                  <td>{formatDuration(route.durationHours)}</td>
                  <td><div className="route-category-list">{route.vehicleCategories.slice(0, 3).map((category) => <span key={category}>{category}</span>)}{route.vehicleCategories.length > 3 && <span>+{route.vehicleCategories.length - 3}</span>}</div></td>
                  <td className="route-fare-cell">{formatMoney(route.baseFare)}</td>
                  <td><RouteStatusBadge status={route.status} /></td>
                  <td className="route-actions-cell">
                    <button className="table-action-button" type="button" aria-label={`View ${route.id}`} onClick={() => setSelectedRoute(route)}><Eye size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Edit ${route.id}`} onClick={() => openEditForm(route)}><Edit3 size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Change status for ${route.id}`} onClick={() => setStatusConfirmation({ route, status: route.status })}><ArrowUpDown size={15} /></button>
                    <button className="table-action-button danger-button" type="button" aria-label={`Delete ${route.id}`} onClick={() => setDeleteConfirmation(route)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9"><div className="empty-state routes-empty-state"><RouteIcon size={20} /><strong>No routes found</strong><span>Adjust your search or filters, or clear all filters to see the full route list.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-row routes-pagination">
          <label className="page-size-control">Rows per page<select aria-label="Routes rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <span className="pagination-count">{filteredRoutes.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredRoutes.length)} of ${filteredRoutes.length}` : '0 routes'}</span>
          <button type="button" className="secondary-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" className="secondary-button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </section>

      {selectedRoute && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedRoute(null)}>
          <section className="routes-details-modal" role="dialog" aria-modal="true" aria-labelledby="route-details-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="route-details-title" eyebrow={`ROUTE DETAILS · ${selectedRoute.id}`} title={selectedRoute.name} onClose={() => setSelectedRoute(null)} closeLabel="Close route details" />
            <p className="routes-detail-subtitle"><MapPin size={14} />{selectedRoute.origin} <span aria-hidden="true">→</span> {selectedRoute.destination}</p>
            <div className="routes-detail-status"><RouteStatusBadge status={selectedRoute.status} /><span>{selectedRoute.type}</span></div>
            <DetailSection title="Route information">
              <DetailItem label="Intermediate stops" value={selectedRoute.stops.length ? selectedRoute.stops.join(' · ') : 'No intermediate stops'} />
              <DetailItem label="Route type" value={selectedRoute.type} />
              <DetailItem label="Distance" value={`${selectedRoute.distanceKm} km`} />
              <DetailItem label="Estimated duration" value={formatDuration(selectedRoute.durationHours)} />
              <DetailItem label="One-way availability" value={selectedRoute.oneWay ? 'Enabled' : 'Disabled'} />
              <DetailItem label="Round-trip availability" value={selectedRoute.roundTrip ? 'Enabled' : 'Disabled'} />
              <DetailItem label="Vehicle categories" value={selectedRoute.vehicleCategories.join(', ')} />
            </DetailSection>
            <DetailSection title="Pricing">
              <DetailItem label="Toll estimate" value={formatMoney(selectedRoute.tollEstimate)} />
              <DetailItem label="Base fare" value={formatMoney(selectedRoute.baseFare)} />
              <DetailItem label="Per-kilometre rate" value={`${formatMoney(selectedRoute.perKmRate)} / km`} />
              <DetailItem label="Minimum fare" value={formatMoney(selectedRoute.minimumFare)} />
            </DetailSection>
            <div className="routes-fare-preview">
              <div><span className="eyebrow">DEMO ESTIMATE · NOT A CUSTOMER QUOTATION</span><strong>{formatMoney(estimateFare(selectedRoute))}</strong></div>
              <p>max(minimum fare, base fare + distance × per-km rate + toll)</p>
              <small>max({formatMoney(selectedRoute.minimumFare)}, {formatMoney(selectedRoute.baseFare)} + {selectedRoute.distanceKm} × {formatMoney(selectedRoute.perKmRate)} + {formatMoney(selectedRoute.tollEstimate)})</small>
            </div>
            <TextDetail label="Description" value={selectedRoute.description} />
            <TextDetail label="Notes" value={selectedRoute.notes} />
            <div className="booking-modal-actions">
              <button type="button" className="secondary-button" onClick={() => openEditForm(selectedRoute)}>Edit route</button>
              <button type="button" className="primary-button" onClick={() => setSelectedRoute(null)}>Done</button>
            </div>
          </section>
        </div>
      )}

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeForm}>
          <section className="routes-form-modal" role="dialog" aria-modal="true" aria-labelledby="route-form-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="route-form-title" eyebrow={editingId ? 'EDIT ROUTE' : 'NEW ROUTE'} title={editingId ? 'Update route' : 'Add route'} onClose={closeForm} closeLabel="Close route form" />
            <form className="routes-form" noValidate onSubmit={submitForm}>
              <FormSection title="Route information">
                <FormField label="Route name" error={errors.name}><input name="name" value={form.name} onChange={updateForm} placeholder="e.g. Kolhapur to Pune" aria-invalid={Boolean(errors.name)} /></FormField>
                <FormField label="Origin city" error={errors.origin}><input name="origin" value={form.origin} onChange={updateForm} aria-invalid={Boolean(errors.origin)} /></FormField>
                <FormField label="Destination city" error={errors.destination}><input name="destination" value={form.destination} onChange={updateForm} aria-invalid={Boolean(errors.destination)} /></FormField>
                <FormField label="Intermediate stops" hint="Separate stops with commas"><input name="stopsText" value={form.stopsText} onChange={updateForm} placeholder="e.g. Karad, Satara" /></FormField>
                <FormField label="Route type" error={errors.type}><select name="type" value={form.type} onChange={updateForm} aria-invalid={Boolean(errors.type)}><option value="">Select a route type</option>{routeTypes.map((type) => <option key={type}>{type}</option>)}</select></FormField>
                <FormField label="Route status"><select name="status" value={form.status} onChange={updateForm}>{routeStatuses.map((status) => <option key={status}>{status}</option>)}</select></FormField>
                <FormField className="routes-form-wide" label="Description"><textarea name="description" rows="2" value={form.description} onChange={updateForm} placeholder="Describe this route" /></FormField>
              </FormSection>
              <FormSection title="Distance and duration">
                <FormField label="Distance (km)" error={errors.distanceKm}><input name="distanceKm" type="number" min="0.1" step="0.1" value={form.distanceKm} onChange={updateForm} aria-invalid={Boolean(errors.distanceKm)} /></FormField>
                <FormField label="Estimated travel duration (hours)" error={errors.durationHours}><input name="durationHours" type="number" min="0.1" step="0.1" value={form.durationHours} onChange={updateForm} placeholder="e.g. 4.5" aria-invalid={Boolean(errors.durationHours)} /></FormField>
              </FormSection>
              <FormSection title="Pricing">
                <FormField label="Toll estimate (₹)" error={errors.tollEstimate}><input name="tollEstimate" type="number" min="0" step="0.01" value={form.tollEstimate} onChange={updateForm} aria-invalid={Boolean(errors.tollEstimate)} /></FormField>
                <FormField label="Base fare (₹)" error={errors.baseFare}><input name="baseFare" type="number" min="0" step="0.01" value={form.baseFare} onChange={updateForm} aria-invalid={Boolean(errors.baseFare)} /></FormField>
                <FormField label="Per-kilometre rate (₹)" error={errors.perKmRate}><input name="perKmRate" type="number" min="0" step="0.01" value={form.perKmRate} onChange={updateForm} aria-invalid={Boolean(errors.perKmRate)} /></FormField>
                <FormField label="Minimum fare (₹)" error={errors.minimumFare}><input name="minimumFare" type="number" min="0" step="0.01" value={form.minimumFare} onChange={updateForm} aria-invalid={Boolean(errors.minimumFare)} /></FormField>
              </FormSection>
              <FormSection title="Availability">
                <div className="routes-availability-options">
                  <label><input type="checkbox" name="oneWay" checked={form.oneWay} onChange={updateForm} />One-way enabled</label>
                  <label><input type="checkbox" name="roundTrip" checked={form.roundTrip} onChange={updateForm} />Round-trip enabled</label>
                  {errors.availability && <small className="field-error" role="alert">{errors.availability}</small>}
                </div>
                <fieldset className="routes-category-field">
                  <legend>Applicable vehicle categories</legend>
                  <div className="routes-category-options">{routeVehicleCategories.map((category) => <label key={category}><input type="checkbox" checked={form.vehicleCategories.includes(category)} onChange={() => toggleCategory(category)} />{category}</label>)}</div>
                  {errors.vehicleCategories && <small className="field-error" role="alert">{errors.vehicleCategories}</small>}
                </fieldset>
                <FormField className="routes-form-wide" label="Notes"><textarea name="notes" rows="2" value={form.notes} onChange={updateForm} placeholder="Internal notes" /></FormField>
              </FormSection>
              <div className="booking-modal-actions">
                <button type="button" className="secondary-button" onClick={closeForm}>Cancel</button>
                <button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add route'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {statusConfirmation && (
        <div className="modal-backdrop" role="presentation" onClick={() => setStatusConfirmation(null)}>
          <section className="booking-modal confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="route-status-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="route-status-title" eyebrow="CONFIRM STATUS CHANGE" title="Update route status" onClose={() => setStatusConfirmation(null)} closeLabel="Close status confirmation" />
            <p className="confirmation-copy">Set {statusConfirmation.route.name} to:</p>
            <label className="vehicle-status-choice">Route status<select aria-label="New route status" value={statusConfirmation.status} onChange={(event) => setStatusConfirmation((current) => ({ ...current, status: event.target.value }))}>{routeStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <div className="booking-modal-actions">
              <button type="button" className="secondary-button" onClick={() => setStatusConfirmation(null)}>Cancel</button>
              <button type="button" className="primary-button" disabled={statusConfirmation.status === statusConfirmation.route.status} onClick={applyStatus}>Confirm status</button>
            </div>
          </section>
        </div>
      )}

      {deleteConfirmation && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDeleteConfirmation(null)}>
          <section className="booking-modal confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="route-delete-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="route-delete-title" eyebrow="DELETE ROUTE" title="Remove this route?" onClose={() => setDeleteConfirmation(null)} closeLabel="Close delete confirmation" />
            <p className="confirmation-copy">This will remove {deleteConfirmation.name} ({deleteConfirmation.id}) from the local demo route list. This action cannot be undone.</p>
            <div className="booking-modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDeleteConfirmation(null)}>Keep route</button>
              <button type="button" className="primary-button destructive-confirm-button" onClick={deleteRoute}>Delete route</button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

function SummaryCard({ label, value, tone }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong><small>Demo route count</small></div>
}

function FilterControl({ label, value, options, onChange }) {
  return <label className="filter-select"><Filter size={14} /><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  const active = sortBy === sortKey
  return <button type="button" className={`vehicle-sort-button ${active ? 'vehicle-sort-active' : ''}`} aria-label={`Sort by ${children}`} aria-sort={active ? direction === 'asc' ? 'ascending' : 'descending' : 'none'} onClick={() => onClick(sortKey)}>{children}<ArrowUpDown size={12} /></button>
}

function RouteStatusBadge({ status }) {
  return <span className={`routes-status-badge routes-status-${status.toLowerCase()}`}>{status}</span>
}

function ModalHeader({ id, eyebrow, title, onClose, closeLabel }) {
  return <div className="modal-header"><div><span className="eyebrow">{eyebrow}</span><h2 id={id}>{title}</h2></div><button className="icon-button" type="button" aria-label={closeLabel} onClick={onClose}><X size={18} /></button></div>
}

function FormSection({ title, children }) {
  return <fieldset className="routes-form-section"><legend>{title}</legend><div className="routes-form-grid">{children}</div></fieldset>
}

function FormField({ label, error, hint, className = '', children }) {
  return <label className={`vehicle-form-field routes-form-field ${className}`}><span>{label}{hint && <small> · {hint}</small>}</span>{children}{error && <small className="field-error" role="alert">{error}</small>}</label>
}

function DetailSection({ title, children }) {
  return <section className="vehicle-detail-section"><h3>{title}</h3><div className="vehicle-detail-grid routes-detail-grid">{children}</div></section>
}

function DetailItem({ label, value }) {
  return <div className="vehicle-detail-item"><small>{label}</small><strong>{value || '—'}</strong></div>
}

function TextDetail({ label, value }) {
  return <div className="vehicle-notes"><strong>{label}</strong><p>{value || 'Not provided.'}</p></div>
}
