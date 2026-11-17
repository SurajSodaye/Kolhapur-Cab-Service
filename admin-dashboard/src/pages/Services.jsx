import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, Download, Edit3, Eye, Filter, Plus, Search, Star, Trash2, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import { mockServices, serviceCategories, servicePricingTypes, serviceStatuses, serviceTripTypes, serviceVehicleCategories } from '../data/mockServices.js'
import {
  subscribeServices,
  saveService as firestoreSaveService,
  deleteService as firestoreDeleteService,
} from '../services/adminFirestoreService.js'

const pageSizes = [10, 20, 50]
const emptyService = {
  name: '',
  shortDescription: '',
  description: '',
  category: '',
  tripType: '',
  vehicleCategories: [],
  pricingType: '',
  basePrice: '',
  perKmRate: '',
  minimumFare: '',
  minimumDurationHours: '',
  featured: false,
  status: 'Active',
  displayOrder: '',
  adminNotes: '',
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day))
}

function pricingSummary(service) {
  if (service.pricingType === 'Custom Quote') return 'Admin quotation required'
  if (service.pricingType === 'Fixed') return `Fixed ${formatMoney(service.basePrice)}`
  if (service.pricingType === 'Per KM') return `${formatMoney(service.perKmRate)} / km · min ${formatMoney(service.minimumFare)}`
  return `${formatMoney(service.basePrice)} / hour · min ${service.minimumDurationHours} hr`
}

function saveCsv(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'services-export.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function validateNonNegative(value, label) {
  if (value === '' || !Number.isFinite(Number(value))) return `Enter a valid ${label}.`
  if (Number(value) < 0) return `${label} cannot be negative.`
  return ''
}

export default function Services() {
  const [services, setServices] = useState(mockServices)

  // Subscribe to real-time Firestore services
  useEffect(() => {
    const unsubscribe = subscribeServices((firestoreServices) => {
      if (firestoreServices && firestoreServices.length > 0) {
        setServices(firestoreServices)
      }
    })
    return () => unsubscribe()
  }, [])
  const sequence = useRef(mockServices.reduce((highest, service) => {
    const match = /^SRV-(\d+)$/.exec(service.id)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 1000) + 1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [pricingFilter, setPricingFilter] = useState('All pricing types')
  const [featuredFilter, setFeaturedFilter] = useState('All')
  const [vehicleFilter, setVehicleFilter] = useState('All vehicle categories')
  const [sortBy, setSortBy] = useState('displayOrder')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyService)
  const [errors, setErrors] = useState({})
  const [selectedService, setSelectedService] = useState(null)
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [toast, setToast] = useState('')

  const filteredServices = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const filtered = services.filter((service) => {
      const matchesSearch = !query || [service.id, service.name, service.shortDescription, service.description, service.category]
        .some((value) => value.toLocaleLowerCase().includes(query))
      const matchesStatus = statusFilter === 'All' || service.status === statusFilter
      const matchesCategory = categoryFilter === 'All categories' || service.category === categoryFilter
      const matchesPricing = pricingFilter === 'All pricing types' || service.pricingType === pricingFilter
      const matchesFeatured = featuredFilter === 'All' || service.featured === (featuredFilter === 'Featured')
      const matchesVehicle = vehicleFilter === 'All vehicle categories' || service.vehicleCategories.includes(vehicleFilter)
      return matchesSearch && matchesStatus && matchesCategory && matchesPricing && matchesFeatured && matchesVehicle
    })
    return filtered.sort((first, second) => {
      const firstValue = first[sortBy]
      const secondValue = second[sortBy]
      const comparison = sortBy === 'basePrice'
        ? (firstValue === null ? Number.NEGATIVE_INFINITY : Number(firstValue)) - (secondValue === null ? Number.NEGATIVE_INFINITY : Number(secondValue))
        : typeof firstValue === 'number' && typeof secondValue === 'number'
          ? firstValue - secondValue
        : String(firstValue ?? '').localeCompare(String(secondValue ?? ''), 'en', { sensitivity: 'base' })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [categoryFilter, featuredFilter, pricingFilter, search, services, sortBy, sortDirection, statusFilter, vehicleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageServices = filteredServices.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const summary = useMemo(() => ({
    total: services.length,
    active: services.filter((service) => service.status === 'Active').length,
    inactive: services.filter((service) => service.status === 'Inactive').length,
    featured: services.filter((service) => service.featured).length,
    custom: services.filter((service) => service.pricingType === 'Custom Quote').length,
  }), [services])

  useEffect(() => {
    const hasOpenDialog = formOpen || selectedService || statusConfirmation || deleteConfirmation
    if (!hasOpenDialog) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFormOpen(false)
        setSelectedService(null)
        setStatusConfirmation(null)
        setDeleteConfirmation(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleteConfirmation, formOpen, selectedService, statusConfirmation])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setCategoryFilter('All categories')
    setPricingFilter('All pricing types')
    setFeaturedFilter('All')
    setVehicleFilter('All vehicle categories')
    setPage(1)
  }

  const openAddForm = () => {
    setEditingId('')
    setForm({ ...emptyService })
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (service) => {
    setEditingId(service.id)
    setForm({ ...service, vehicleCategories: [...service.vehicleCategories] })
    setErrors({})
    setSelectedService(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyService })
    setErrors({})
  }

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => {
      if (name === 'pricingType') {
        return {
          ...current,
          pricingType: value,
          basePrice: value === 'Custom Quote' ? '' : current.basePrice,
          perKmRate: value === 'Per KM' ? current.perKmRate : '',
          minimumFare: value === 'Per KM' ? current.minimumFare : '',
          minimumDurationHours: value === 'Hourly' ? current.minimumDurationHours : '',
        }
      }
      return {
        ...current,
        [name]: type === 'checkbox'
          ? checked
          : ['basePrice', 'perKmRate', 'minimumFare', 'minimumDurationHours', 'displayOrder'].includes(name)
            ? (value === '' ? '' : Number(value))
            : value,
      }
    })
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const toggleVehicleCategory = (category) => {
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
    const duplicateName = services.some((service) => (
      service.id !== editingId && normalizeName(service.name) === normalizeName(form.name)
    ))

    if (!form.name.trim()) validation.name = 'Enter a service name.'
    else if (duplicateName) validation.name = 'A service with this name already exists.'
    if (!form.shortDescription.trim()) validation.shortDescription = 'Enter a short description.'
    if (!form.description.trim()) validation.description = 'Enter a full description.'
    if (!serviceCategories.includes(form.category)) validation.category = 'Select a service category.'
    if (!serviceTripTypes.includes(form.tripType)) validation.tripType = 'Select a trip type.'
    if (!servicePricingTypes.includes(form.pricingType)) validation.pricingType = 'Select a pricing type.'
    if (!form.vehicleCategories.length) validation.vehicleCategories = 'Select at least one vehicle category.'
    if (!serviceStatuses.includes(form.status)) validation.status = 'Select a service status.'

    const basePriceError = form.pricingType !== 'Custom Quote' && (form.basePrice === '' || form.basePrice === null)
      ? 'Enter a base price.'
      : form.basePrice === '' || form.basePrice === null ? '' : validateNonNegative(form.basePrice, 'base price')
    if (basePriceError) validation.basePrice = basePriceError
    if (form.pricingType === 'Per KM') {
      const rateError = form.perKmRate === '' || form.perKmRate === null ? 'Enter a per-kilometre rate.' : validateNonNegative(form.perKmRate, 'per-kilometre rate')
      if (rateError) validation.perKmRate = rateError
      const minimumError = form.minimumFare === '' || form.minimumFare === null ? 'Enter a minimum fare.' : validateNonNegative(form.minimumFare, 'minimum fare')
      if (minimumError) validation.minimumFare = minimumError
    }
    if (form.pricingType === 'Hourly') {
      if (form.minimumDurationHours === '' || form.minimumDurationHours === null || !Number.isFinite(Number(form.minimumDurationHours)) || Number(form.minimumDurationHours) <= 0) {
        validation.minimumDurationHours = 'Minimum duration must be greater than zero.'
      }
    }
    if (form.displayOrder === '' || !Number.isInteger(Number(form.displayOrder)) || Number(form.displayOrder) < 0) {
      validation.displayOrder = 'Enter a valid non-negative whole number.'
    }

    setErrors(validation)
    if (Object.keys(validation).length) return

    const savedService = {
      ...form,
      id: editingId || `SRV-${sequence.current++}`,
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      basePrice: form.pricingType === 'Custom Quote' && (form.basePrice === '' || form.basePrice === null) ? null : Number(form.basePrice),
      perKmRate: form.pricingType === 'Per KM' ? Number(form.perKmRate) : null,
      minimumFare: form.pricingType === 'Per KM' ? Number(form.minimumFare) : null,
      minimumDurationHours: form.pricingType === 'Hourly' ? Number(form.minimumDurationHours) : null,
      displayOrder: Number(form.displayOrder),
      adminNotes: form.adminNotes.trim(),
      vehicleCategories: [...form.vehicleCategories],
      createdDate: editingId ? services.find((service) => service.id === editingId).createdDate : new Date().toISOString().slice(0, 10),
    }
    setServices((current) => editingId
      ? current.map((service) => service.id === editingId ? savedService : service)
      : [savedService, ...current])
    firestoreSaveService(savedService).catch((err) => console.warn('Firestore service save error:', err))
    closeForm()
    setPage(1)
    notify(editingId ? 'Service updated successfully.' : `${savedService.name} added successfully.`)
  }

  const toggleFeatured = (service) => {
    const featured = !service.featured
    const updated = { ...service, featured }
    setServices((current) => current.map((item) => item.id === service.id ? updated : item))
    firestoreSaveService(updated).catch((err) => console.warn('Firestore service update error:', err))
    notify(`${service.name} ${featured ? 'marked as featured' : 'removed from featured services'}.`)
  }

  const applyStatus = () => {
    if (!statusConfirmation) return
    const updated = { ...statusConfirmation.service, status: statusConfirmation.status }
    setServices((current) => current.map((service) => (
      service.id === statusConfirmation.service.id ? updated : service
    )))
    firestoreSaveService(updated).catch((err) => console.warn('Firestore service update error:', err))
    notify(`${statusConfirmation.service.name} marked ${statusConfirmation.status.toLowerCase()}.`)
    setStatusConfirmation(null)
  }

  const deleteService = () => {
    if (!deleteConfirmation) return
    const name = deleteConfirmation.name
    setServices((current) => current.filter((service) => service.id !== deleteConfirmation.id))
    firestoreDeleteService(deleteConfirmation.id).catch((err) => console.warn('Firestore service delete error:', err))
    setPage((current) => Math.max(1, Math.min(current, Math.ceil(Math.max(0, filteredServices.length - 1) / pageSize))))
    setDeleteConfirmation(null)
    notify(`${name} deleted.`)
  }

  const exportCsv = () => {
    const headers = [
      'Service ID', 'Service name', 'Short description', 'Full description', 'Category', 'Trip type',
      'Vehicle categories', 'Pricing type', 'Base price', 'Per-kilometre rate', 'Minimum fare',
      'Minimum booking duration (hours)', 'Featured', 'Status', 'Display order', 'Admin notes', 'Created date',
    ]
    const rows = filteredServices.map((service) => [
      service.id, service.name, service.shortDescription, service.description, service.category, service.tripType,
      service.vehicleCategories.join(', '), service.pricingType, service.basePrice, service.perKmRate,
      service.minimumFare, service.minimumDurationHours, service.featured ? 'Yes' : 'No', service.status,
      service.displayOrder, service.adminNotes, service.createdDate,
    ])
    saveCsv([headers, ...rows])
  }

  const sortByOptions = [
    ['name', 'Service name'], ['category', 'Category'], ['pricingType', 'Pricing type'],
    ['basePrice', 'Base price'], ['displayOrder', 'Display order'], ['status', 'Status'],
  ]

  return (
    <>
      <PageHeader title="Services Management" description="Manage cab services, pricing options and availability.">
        <div className="services-page-actions">
          <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
          <button type="button" className="primary-button" onClick={openAddForm}><Plus size={14} />Add Service</button>
        </div>
      </PageHeader>
      <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Demo service data</strong> — all sample prices are illustrative only, not actual customer quotations.</span></div>

      <section className="services-summary-grid" aria-label="Service overview">
        <SummaryCard label="Total Services" value={summary.total} tone="blue" />
        <SummaryCard label="Active Services" value={summary.active} tone="green" />
        <SummaryCard label="Inactive Services" value={summary.inactive} tone="slate" />
        <SummaryCard label="Featured Services" value={summary.featured} tone="violet" />
        <SummaryCard label="Services with Custom Pricing" value={summary.custom} tone="amber" />
      </section>
      {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

      <section className="panel services-management-panel">
        <div className="panel-heading services-panel-heading">
          <div><h2>Service directory</h2><p>Search, filter, sort and maintain your service offerings.</p></div>
          <span className="vehicle-result-count">{filteredServices.length} services</span>
        </div>
        <div className="services-filters">
          <label className="search-field"><Search size={15} /><input type="search" aria-label="Search services" placeholder="Search ID, service, description or category..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
          <FilterControl label="Filter services by status" value={statusFilter} options={['All', ...serviceStatuses]} onChange={(value) => { setStatusFilter(value); setPage(1) }} />
          <FilterControl label="Filter services by category" value={categoryFilter} options={['All categories', ...serviceCategories]} onChange={(value) => { setCategoryFilter(value); setPage(1) }} />
          <FilterControl label="Filter services by pricing type" value={pricingFilter} options={['All pricing types', ...servicePricingTypes]} onChange={(value) => { setPricingFilter(value); setPage(1) }} />
          <FilterControl label="Filter featured services" value={featuredFilter} options={['All', 'Featured', 'Not Featured']} onChange={(value) => { setFeaturedFilter(value); setPage(1) }} />
          <FilterControl label="Filter by vehicle category" value={vehicleFilter} options={['All vehicle categories', ...serviceVehicleCategories]} onChange={(value) => { setVehicleFilter(value); setPage(1) }} />
          <label className="filter-select"><ArrowUpDown size={14} /><select aria-label="Sort services by" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1) }}>{sortByOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button type="button" className="secondary-button services-sort-direction" aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`} onClick={() => { setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
          <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear All Filters</button>
        </div>

        <div className="table-scroll services-table-scroll">
          <table className="data-table services-table">
            <thead><tr>
              <th>Service ID</th><th>Service</th>
              <th><SortButton sortKey="category" sortBy={sortBy} direction={sortDirection} onClick={(key) => { setSortBy(key); setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>Category</SortButton></th>
              <th>Vehicle categories</th>
              <th><SortButton sortKey="pricingType" sortBy={sortBy} direction={sortDirection} onClick={(key) => { setSortBy(key); setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>Pricing type</SortButton></th>
              <th><SortButton sortKey="basePrice" sortBy={sortBy} direction={sortDirection} onClick={(key) => { setSortBy(key); setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>Base price</SortButton></th>
              <th><SortButton sortKey="featured" sortBy={sortBy} direction={sortDirection} onClick={(key) => { setSortBy(key); setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>Featured</SortButton></th>
              <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={(key) => { setSortBy(key); setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>Status</SortButton></th>
              <th>Actions</th>
            </tr></thead>
            <tbody>
              {pageServices.length ? pageServices.map((service) => (
                <tr key={service.id}>
                  <td className="service-id-cell">{service.id}</td>
                  <td><div className="service-name-cell"><strong>{service.name}</strong><small>{service.shortDescription}</small></div></td>
                  <td>{service.category}</td>
                  <td><div className="service-category-list">{service.vehicleCategories.slice(0, 3).map((category) => <span key={category}>{category}</span>)}{service.vehicleCategories.length > 3 && <span>+{service.vehicleCategories.length - 3}</span>}</div></td>
                  <td>{service.pricingType}</td>
                  <td className="service-fare-cell">{formatMoney(service.basePrice)}</td>
                  <td><button className={`service-feature-toggle ${service.featured ? 'service-feature-on' : ''}`} type="button" aria-label={`${service.featured ? 'Remove featured from' : 'Mark featured'} ${service.id}`} aria-pressed={service.featured} onClick={() => toggleFeatured(service)}><Star size={14} fill={service.featured ? 'currentColor' : 'none'} />{service.featured ? 'Featured' : 'No'}</button></td>
                  <td><ServiceStatusBadge status={service.status} /></td>
                  <td className="service-actions-cell">
                    <button className="table-action-button" type="button" aria-label={`View ${service.id}`} onClick={() => setSelectedService(service)}><Eye size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Edit ${service.id}`} onClick={() => openEditForm(service)}><Edit3 size={15} /></button>
                    <button className="table-action-button" type="button" aria-label={`Change status for ${service.id}`} onClick={() => setStatusConfirmation({ service, status: service.status })}><ArrowUpDown size={15} /></button>
                    <button className="table-action-button danger-button" type="button" aria-label={`Delete ${service.id}`} onClick={() => setDeleteConfirmation(service)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              )) : <tr><td colSpan="9"><div className="empty-state services-empty-state"><Search size={20} /><strong>No services found</strong><span>Adjust your search or filters, or clear all filters to see the full service list.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination-row services-pagination">
          <label className="page-size-control">Rows per page<select aria-label="Services rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <span className="pagination-count">{filteredServices.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredServices.length)} of ${filteredServices.length}` : '0 services'}</span>
          <button type="button" className="secondary-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {totalPages}</span>
          <button type="button" className="secondary-button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </section>

      {selectedService && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedService(null)}>
          <section className="services-details-modal" role="dialog" aria-modal="true" aria-labelledby="service-details-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="service-details-title" eyebrow={`SERVICE DETAILS · ${selectedService.id}`} title={selectedService.name} onClose={() => setSelectedService(null)} closeLabel="Close service details" />
            <p className="service-details-description">{selectedService.shortDescription}</p>
            <div className="service-details-badges"><ServiceStatusBadge status={selectedService.status} /><span className={selectedService.featured ? 'service-featured-label' : 'service-not-featured-label'}><Star size={13} fill={selectedService.featured ? 'currentColor' : 'none'} />{selectedService.featured ? 'Featured' : 'Not featured'}</span></div>
            <DetailSection title="Service information">
              <DetailItem label="Service ID" value={selectedService.id} /><DetailItem label="Category" value={selectedService.category} />
              <DetailItem label="Trip type" value={selectedService.tripType} /><DetailItem label="Vehicle categories" value={selectedService.vehicleCategories.join(', ')} />
              <DetailItem label="Display order" value={selectedService.displayOrder} /><DetailItem label="Created date" value={formatDate(selectedService.createdDate)} />
            </DetailSection>
            <div className="service-description-block"><strong>Full description</strong><p>{selectedService.description}</p></div>
            <DetailSection title="Pricing configuration">
              <DetailItem label="Pricing type" value={selectedService.pricingType} /><DetailItem label="Base price" value={formatMoney(selectedService.basePrice)} />
              {selectedService.pricingType === 'Per KM' && <><DetailItem label="Per-kilometre rate" value={`${formatMoney(selectedService.perKmRate)} / km`} /><DetailItem label="Minimum fare" value={formatMoney(selectedService.minimumFare)} /></>}
              {selectedService.pricingType === 'Hourly' && <DetailItem label="Minimum booking duration" value={`${selectedService.minimumDurationHours} hours`} />}
            </DetailSection>
            <PricingPreview service={selectedService} />
            <div className="vehicle-notes"><strong>Admin notes</strong><p>{selectedService.adminNotes || 'No admin notes.'}</p></div>
            <div className="booking-modal-actions"><button type="button" className="secondary-button" onClick={() => openEditForm(selectedService)}>Edit service</button><button type="button" className="primary-button" onClick={() => setSelectedService(null)}>Done</button></div>
          </section>
        </div>
      )}

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeForm}>
          <section className="services-form-modal" role="dialog" aria-modal="true" aria-labelledby="service-form-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="service-form-title" eyebrow={editingId ? 'EDIT SERVICE' : 'NEW SERVICE'} title={editingId ? 'Update service' : 'Add service'} onClose={closeForm} closeLabel="Close service form" />
            <form className="services-form" noValidate onSubmit={submitForm}>
              <FormSection title="Service information">
                <FormField label="Service name" error={errors.name}><input name="name" value={form.name} onChange={updateForm} aria-invalid={Boolean(errors.name)} /></FormField>
                <FormField label="Category" error={errors.category}><select name="category" value={form.category} onChange={updateForm} aria-invalid={Boolean(errors.category)}><option value="">Select a category</option>{serviceCategories.map((item) => <option key={item}>{item}</option>)}</select></FormField>
                <FormField className="services-form-wide" label="Short description" error={errors.shortDescription}><input name="shortDescription" value={form.shortDescription} onChange={updateForm} aria-invalid={Boolean(errors.shortDescription)} /></FormField>
                <FormField label="Trip type" error={errors.tripType}><select name="tripType" value={form.tripType} onChange={updateForm} aria-invalid={Boolean(errors.tripType)}><option value="">Select a trip type</option>{serviceTripTypes.map((item) => <option key={item}>{item}</option>)}</select></FormField>
                <FormField label="Active status"><select name="status" value={form.status} onChange={updateForm}>{serviceStatuses.map((item) => <option key={item}>{item}</option>)}</select></FormField>
                <FormField className="services-form-wide" label="Full description" error={errors.description}><textarea name="description" rows="3" value={form.description} onChange={updateForm} aria-invalid={Boolean(errors.description)} /></FormField>
              </FormSection>
              <FormSection title="Pricing">
                <FormField label="Pricing type" error={errors.pricingType}><select name="pricingType" value={form.pricingType} onChange={updateForm} aria-invalid={Boolean(errors.pricingType)}><option value="">Select pricing type</option>{servicePricingTypes.map((item) => <option key={item}>{item}</option>)}</select></FormField>
                {form.pricingType && form.pricingType !== 'Custom Quote' && <FormField label={form.pricingType === 'Hourly' ? 'Hourly / base price (₹)' : 'Base price (₹)'} error={errors.basePrice}><input name="basePrice" type="number" min="0" step="0.01" value={form.basePrice} onChange={updateForm} aria-invalid={Boolean(errors.basePrice)} /></FormField>}
                {form.pricingType === 'Per KM' && <>
                  <FormField label="Per-kilometre rate (₹)" error={errors.perKmRate}><input name="perKmRate" type="number" min="0" step="0.01" value={form.perKmRate} onChange={updateForm} aria-invalid={Boolean(errors.perKmRate)} /></FormField>
                  <FormField label="Minimum fare (₹)" error={errors.minimumFare}><input name="minimumFare" type="number" min="0" step="0.01" value={form.minimumFare} onChange={updateForm} aria-invalid={Boolean(errors.minimumFare)} /></FormField>
                </>}
                {form.pricingType === 'Hourly' && <FormField label="Minimum booking duration (hours)" error={errors.minimumDurationHours}><input name="minimumDurationHours" type="number" min="0.1" step="0.1" value={form.minimumDurationHours} onChange={updateForm} aria-invalid={Boolean(errors.minimumDurationHours)} /></FormField>}
                {form.pricingType && <div className="services-preview-wrap"><PricingPreview service={form} /></div>}
              </FormSection>
              <FormSection title="Availability and display">
                <fieldset className="services-vehicle-field"><legend>Available vehicle categories</legend><div className="services-vehicle-options">{serviceVehicleCategories.map((category) => <label key={category}><input type="checkbox" checked={form.vehicleCategories.includes(category)} onChange={() => toggleVehicleCategory(category)} />{category}</label>)}</div>{errors.vehicleCategories && <small className="field-error" role="alert">{errors.vehicleCategories}</small>}</fieldset>
                <div className="services-display-options">
                  <label className="services-feature-control"><input name="featured" type="checkbox" checked={form.featured} onChange={updateForm} /><Star size={14} fill={form.featured ? 'currentColor' : 'none'} />Featured service</label>
                  <FormField label="Display order" error={errors.displayOrder}><input name="displayOrder" type="number" min="0" step="1" value={form.displayOrder} onChange={updateForm} aria-invalid={Boolean(errors.displayOrder)} /></FormField>
                </div>
                <FormField className="services-form-wide" label="Admin notes"><textarea name="adminNotes" rows="2" value={form.adminNotes} onChange={updateForm} /></FormField>
              </FormSection>
              <p className="services-demo-note">All sample prices are illustrative demo values, not actual customer quotations.</p>
              <div className="booking-modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add service'}</button></div>
            </form>
          </section>
        </div>
      )}

      {statusConfirmation && (
        <div className="modal-backdrop" role="presentation" onClick={() => setStatusConfirmation(null)}>
          <section className="booking-modal confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="service-status-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="service-status-title" eyebrow="CONFIRM STATUS CHANGE" title="Update service status" onClose={() => setStatusConfirmation(null)} closeLabel="Close status confirmation" />
            <p className="confirmation-copy">Set {statusConfirmation.service.name} to:</p>
            <label className="vehicle-status-choice">Service status<select aria-label="New service status" value={statusConfirmation.status} onChange={(event) => setStatusConfirmation((current) => ({ ...current, status: event.target.value }))}>{serviceStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <div className="booking-modal-actions"><button type="button" className="secondary-button" onClick={() => setStatusConfirmation(null)}>Cancel</button><button type="button" className="primary-button" disabled={statusConfirmation.status === statusConfirmation.service.status} onClick={applyStatus}>Confirm status</button></div>
          </section>
        </div>
      )}

      {deleteConfirmation && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDeleteConfirmation(null)}>
          <section className="booking-modal confirmation-modal" role="alertdialog" aria-modal="true" aria-labelledby="service-delete-title" onClick={(event) => event.stopPropagation()}>
            <ModalHeader id="service-delete-title" eyebrow="DELETE SERVICE" title="Remove this service?" onClose={() => setDeleteConfirmation(null)} closeLabel="Close delete confirmation" />
            <p className="confirmation-copy">This will remove {deleteConfirmation.name} ({deleteConfirmation.id}) from the local demo list. This action cannot be undone.</p>
            <div className="booking-modal-actions"><button type="button" className="secondary-button" onClick={() => setDeleteConfirmation(null)}>Keep service</button><button type="button" className="primary-button destructive-confirm-button" onClick={deleteService}>Delete service</button></div>
          </section>
        </div>
      )}
    </>
  )
}

function SummaryCard({ label, value, tone }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong><small>Demo service count</small></div>
}

function FilterControl({ label, value, options, onChange }) {
  return <label className="filter-select"><Filter size={14} /><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  const active = sortBy === sortKey
  return <button type="button" className={`vehicle-sort-button ${active ? 'vehicle-sort-active' : ''}`} aria-label={`Sort by ${children}`} aria-sort={active ? direction === 'asc' ? 'ascending' : 'descending' : 'none'} onClick={() => onClick(sortKey)}>{children}<ArrowUpDown size={12} /></button>
}

function ServiceStatusBadge({ status }) {
  return <span className={`services-status-badge services-status-${status.toLowerCase()}`}>{status}</span>
}

function ModalHeader({ id, eyebrow, title, onClose, closeLabel }) {
  return <div className="modal-header"><div><span className="eyebrow">{eyebrow}</span><h2 id={id}>{title}</h2></div><button className="icon-button" type="button" aria-label={closeLabel} onClick={onClose}><X size={18} /></button></div>
}

function FormSection({ title, children }) {
  return <fieldset className="services-form-section"><legend>{title}</legend><div className="services-form-grid">{children}</div></fieldset>
}

function FormField({ label, error, className = '', children }) {
  return <label className={`vehicle-form-field services-form-field ${className}`}><span>{label}</span>{children}{error && <small className="field-error" role="alert">{error}</small>}</label>
}

function DetailSection({ title, children }) {
  return <section className="vehicle-detail-section"><h3>{title}</h3><div className="vehicle-detail-grid services-detail-grid">{children}</div></section>
}

function DetailItem({ label, value }) {
  return <div className="vehicle-detail-item"><small>{label}</small><strong>{value || '—'}</strong></div>
}

function PricingPreview({ service }) {
  let title = 'Illustrative pricing preview'
  let price = 'Select a pricing type'
  let formula = 'Sample prices are not customer quotations.'
  if (service.pricingType === 'Fixed') {
    price = formatMoney(service.basePrice)
    formula = 'Fixed demo price per service.'
  } else if (service.pricingType === 'Per KM') {
    price = `${formatMoney(service.basePrice)} base + ${formatMoney(service.perKmRate)} / km`
    formula = `Minimum fare: ${formatMoney(service.minimumFare)}. Total depends on trip distance.`
  } else if (service.pricingType === 'Hourly') {
    price = `${formatMoney(service.basePrice)} / hour`
    formula = `Minimum booking duration: ${service.minimumDurationHours || '—'} hours.`
  } else if (service.pricingType === 'Custom Quote') {
    price = 'Admin quotation required'
    formula = 'No fixed demo amount is configured for this service.'
  }
  return <div className="services-pricing-preview"><span className="eyebrow">{title} · DEMO ONLY</span><strong>{price}</strong><small>{formula}</small></div>
}
