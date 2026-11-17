import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, Copy, Download, Edit3, Eye, Plus, Search, Star, Trash2, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import { mockOffers, offerDiscountTypes, offerServices, offerStatuses } from '../data/mockOffers.js'
import {
  subscribeOffers,
  saveOffer as firestoreSaveOffer,
  deleteOffer as firestoreDeleteOffer,
} from '../services/adminFirestoreService.js'

const pageSizes = [10, 20, 50]
const emptyOffer = {
  name: '', code: '', description: '', discountType: 'Percentage', discountValue: '',
  minimumBookingAmount: '0', maximumDiscount: '', validFrom: '', validUntil: '',
  usageLimit: '', usageCount: '0', perCustomerLimit: '', service: 'All services',
  minimumPassengers: '', status: 'Active', featured: false, sampleBookingAmount: '5000',
}
const statusTone = { Active: 'green', Inactive: 'slate', Scheduled: 'blue', Expired: 'red', 'Usage Limit Reached': 'amber' }

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function todayDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function effectiveStatus(offer, today = todayDate()) {
  if (offer.status === 'Inactive') return 'Inactive'
  if (isValidDate(offer.validUntil) && offer.validUntil < today) return 'Expired'
  if (offer.status === 'Scheduled' || (isValidDate(offer.validFrom) && offer.validFrom > today)) return 'Scheduled'
  if (offer.usageLimit !== '' && offer.usageLimit !== null && Number(offer.usageCount) >= Number(offer.usageLimit)) return 'Usage Limit Reached'
  return 'Active'
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

function displayDate(value) {
  if (!isValidDate(value)) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day))
}

function displayDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function saveCsv(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'offers-export.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function createOfferId(offers, sequence) {
  const ids = new Set(offers.map((offer) => offer.id))
  let next = sequence.current
  while (ids.has(`OFF-2026-${next}`)) next += 1
  sequence.current = next + 1
  return `OFF-2026-${next}`
}

function getPreview(offer, sampleAmount) {
  const amount = Number(sampleAmount)
  const minimum = Number(offer.minimumBookingAmount)
  const validAmount = Number.isFinite(amount) && amount >= 0
  const meetsMinimum = validAmount && amount >= minimum
  let discount = 0
  if (meetsMinimum && Number(offer.discountValue) > 0) {
    discount = offer.discountType === 'Percentage'
      ? amount * Number(offer.discountValue) / 100
      : Number(offer.discountValue)
    if (offer.discountType === 'Percentage' && offer.maximumDiscount !== '' && offer.maximumDiscount !== null) {
      discount = Math.min(discount, Number(offer.maximumDiscount))
    }
    discount = Math.min(amount, discount)
  }
  return { amount: validAmount ? amount : 0, discount, payable: Math.max(0, (validAmount ? amount : 0) - discount), meetsMinimum }
}

function SummaryCard({ label, value, tone, supporting }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong>{supporting && <small>{supporting}</small>}</div>
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${statusTone[status] || 'slate'}`}>{status}</span>
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  return <button type="button" className={`offers-sort-button ${sortBy === sortKey ? 'offers-sort-active' : ''}`} onClick={() => onClick(sortKey)} aria-label={`Sort by ${children}, ${sortBy === sortKey && direction === 'asc' ? 'descending' : 'ascending'}`}>
    {children}<ArrowUpDown size={11} />
  </button>
}

function FormField({ label, name, value, onChange, error, type = 'text', required = false, options, min, max, step, placeholder, wide }) {
  const errorId = `offer-error-${name}`
  return <label className={`offers-form-field${wide ? ' offers-form-wide' : ''}`}>
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    {options
      ? <select name={name} value={value} onChange={onChange} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      : type === 'textarea'
        ? <textarea name={name} value={value} onChange={onChange} rows="3" placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        : <input name={name} type={type} value={value} onChange={onChange} required={required} min={min} max={max} step={step} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />}
    {error && <small id={errorId} className="field-error">{error}</small>}
  </label>
}

function DetailItem({ label, children }) {
  return <div className="offers-detail-item"><small>{label}</small><strong>{children || '—'}</strong></div>
}

function DiscountPreview({ offer, sampleAmount, onSampleAmountChange }) {
  const preview = getPreview(offer, sampleAmount)
  return <section className="offers-preview" aria-label="Demo discount calculation preview">
    <div><strong>Demo calculation preview</strong><small>Illustrative only — not connected to checkout or payments.</small></div>
    <label>Sample booking amount<input aria-label="Sample booking amount" type="number" min="0" step="0.01" value={sampleAmount} onChange={(event) => onSampleAmountChange(event.target.value)} /></label>
    <div className="offers-preview-values">
      <span>Booking <strong>{formatMoney(preview.amount)}</strong></span>
      <span>Discount <strong>{formatMoney(preview.discount)}</strong></span>
      <span>Final payable <strong>{formatMoney(preview.payable)}</strong></span>
    </div>
    <p className={preview.meetsMinimum ? 'offers-minimum-met' : 'offers-minimum-unmet'}>{preview.meetsMinimum ? 'Minimum booking amount is met.' : `Minimum booking amount of ${formatMoney(offer.minimumBookingAmount)} is not met; no discount applies.`}</p>
  </section>
}

export default function Offers() {
  const [offers, setOffers] = useState(mockOffers)

  // Subscribe to real-time Firestore offers
  useEffect(() => {
    const unsubscribe = subscribeOffers((firestoreOffers) => {
      if (firestoreOffers && firestoreOffers.length > 0) {
        setOffers(firestoreOffers)
      }
    })
    return () => unsubscribe()
  }, [])
  const sequence = useRef(mockOffers.reduce((highest, offer) => {
    const match = /^OFF-2026-(\d+)$/.exec(offer.id)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 4000) + 1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [discountFilter, setDiscountFilter] = useState('All discount types')
  const [featuredFilter, setFeaturedFilter] = useState('All offers')
  const [serviceFilter, setServiceFilter] = useState('Any service')
  const [validOn, setValidOn] = useState('')
  const [sortBy, setSortBy] = useState('validUntil')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState({ ...emptyOffer })
  const [errors, setErrors] = useState({})
  const [selectedId, setSelectedId] = useState('')
  const [detailSampleAmount, setDetailSampleAmount] = useState('5000')
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [toast, setToast] = useState('')

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return offers.filter((offer) => {
      const currentStatus = effectiveStatus(offer)
      return (!query || [offer.id, offer.name, offer.code, offer.description].some((value) => String(value || '').toLocaleLowerCase().includes(query)))
        && (statusFilter === 'All statuses' || currentStatus === statusFilter)
        && (discountFilter === 'All discount types' || offer.discountType === discountFilter)
        && (featuredFilter === 'All offers' || offer.featured === (featuredFilter === 'Featured'))
        && (serviceFilter === 'Any service' || offer.service === serviceFilter)
        && (!validOn || (offer.validFrom <= validOn && offer.validUntil >= validOn))
    }).sort((first, second) => {
      let comparison
      if (sortBy === 'discountValue' || sortBy === 'minimumBookingAmount' || sortBy === 'usageCount') {
        comparison = Number(first[sortBy] || 0) - Number(second[sortBy] || 0)
      } else if (sortBy === 'status') {
        comparison = effectiveStatus(first).localeCompare(effectiveStatus(second))
      } else comparison = String(first[sortBy] ?? '').localeCompare(String(second[sortBy] ?? ''), 'en', { sensitivity: 'base', numeric: true })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [discountFilter, featuredFilter, offers, search, serviceFilter, sortBy, sortDirection, statusFilter, validOn])

  const summary = useMemo(() => ({
    total: offers.length,
    active: offers.filter((offer) => effectiveStatus(offer) === 'Active').length,
    scheduled: offers.filter((offer) => effectiveStatus(offer) === 'Scheduled').length,
    expired: offers.filter((offer) => effectiveStatus(offer) === 'Expired').length,
    redemptions: offers.reduce((total, offer) => total + Number(offer.usageCount || 0), 0),
  }), [offers])
  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageOffers = filteredOffers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selectedOffer = offers.find((offer) => offer.id === selectedId)

  useEffect(() => {
    if (!(formOpen || selectedId || deleteConfirmation || statusConfirmation)) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setFormOpen(false)
        setSelectedId('')
        setDeleteConfirmation(null)
        setStatusConfirmation(null)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [deleteConfirmation, formOpen, selectedId, statusConfirmation])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All statuses')
    setDiscountFilter('All discount types')
    setFeaturedFilter('All offers')
    setServiceFilter('Any service')
    setValidOn('')
    setPage(1)
  }

  const openAddForm = () => {
    setSelectedId('')
    setEditingId('')
    setForm({ ...emptyOffer })
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (offer) => {
    setSelectedId('')
    setEditingId(offer.id)
    setForm({
      ...offer,
      discountValue: String(offer.discountValue),
      minimumBookingAmount: String(offer.minimumBookingAmount),
      maximumDiscount: offer.maximumDiscount === '' || offer.maximumDiscount === null ? '' : String(offer.maximumDiscount),
      usageLimit: offer.usageLimit === '' || offer.usageLimit === null ? '' : String(offer.usageLimit),
      usageCount: String(offer.usageCount),
      perCustomerLimit: offer.perCustomerLimit === '' || offer.perCustomerLimit === null ? '' : String(offer.perCustomerLimit),
      minimumPassengers: offer.minimumPassengers === '' || offer.minimumPassengers === null ? '' : String(offer.minimumPassengers),
      sampleBookingAmount: '5000',
    })
    setErrors({})
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyOffer })
    setErrors({})
  }

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'discountType' && value !== 'Percentage' ? { maximumDiscount: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submitForm = (event) => {
    event.preventDefault()
    const validation = {}
    const normalizedCode = form.code.trim().toLocaleUpperCase()
    if (!form.name.trim()) validation.name = 'Enter an offer name.'
    if (!normalizedCode) validation.code = 'Enter a coupon code.'
    else if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) validation.code = 'Use letters, numbers, hyphens or underscores only.'
    else if (offers.some((offer) => offer.code.toLocaleUpperCase() === normalizedCode && offer.id !== editingId)) validation.code = 'This coupon code is already in use.'
    if (!offerDiscountTypes.includes(form.discountType)) validation.discountType = 'Select a discount type.'
    if (form.discountValue === '' || !Number.isFinite(Number(form.discountValue)) || Number(form.discountValue) <= 0) validation.discountValue = 'Enter a positive discount value.'
    else if (form.discountType === 'Percentage' && Number(form.discountValue) > 100) validation.discountValue = 'Percentage discount cannot exceed 100%.'
    if (form.minimumBookingAmount === '' || !Number.isFinite(Number(form.minimumBookingAmount)) || Number(form.minimumBookingAmount) < 0) validation.minimumBookingAmount = 'Enter a valid non-negative amount.'
    if (form.maximumDiscount !== '' && (!Number.isFinite(Number(form.maximumDiscount)) || Number(form.maximumDiscount) <= 0)) validation.maximumDiscount = 'Maximum discount must be a positive amount.'
    if (form.maximumDiscount !== '' && form.discountType !== 'Percentage') validation.maximumDiscount = 'Maximum discount applies only to percentage offers.'
    if (!isValidDate(form.validFrom)) validation.validFrom = 'Enter a valid start date.'
    if (!isValidDate(form.validUntil)) validation.validUntil = 'Enter a valid end date.'
    if (isValidDate(form.validFrom) && isValidDate(form.validUntil) && form.validUntil < form.validFrom) validation.validUntil = 'End date cannot be earlier than start date.'
    for (const [field, label] of [['usageLimit', 'Usage limit'], ['perCustomerLimit', 'Per-customer limit'], ['minimumPassengers', 'Minimum passengers']]) {
      if (form[field] !== '' && (!/^\d+$/.test(String(form[field])) || Number(form[field]) < 1)) validation[field] = `${label} must be a positive whole number.`
    }
    if (!/^\d+$/.test(String(form.usageCount)) || Number(form.usageCount) < 0) validation.usageCount = 'Usage count must be a non-negative whole number.'
    if (!offerServices.includes(form.service)) validation.service = 'Select an applicable service.'
    if (!offerStatuses.includes(form.status)) validation.status = 'Select an offer status.'
    if (form.sampleBookingAmount === '' || !Number.isFinite(Number(form.sampleBookingAmount)) || Number(form.sampleBookingAmount) < 0) validation.sampleBookingAmount = 'Enter a valid sample amount.'
    setErrors(validation)
    if (Object.keys(validation).length) return

    const timestamp = new Date().toISOString().slice(0, 19)
    const existing = editingId ? offers.find((offer) => offer.id === editingId) : null
    const { sampleBookingAmount, ...offerFields } = form
    const savedOffer = {
      ...offerFields,
      id: editingId || createOfferId(offers, sequence),
      name: form.name.trim(),
      code: normalizedCode,
      description: form.description.trim(),
      discountValue: Number(form.discountValue),
      minimumBookingAmount: Number(form.minimumBookingAmount),
      maximumDiscount: form.maximumDiscount === '' ? '' : Number(form.maximumDiscount),
      usageLimit: form.usageLimit === '' ? '' : Number(form.usageLimit),
      usageCount: Number(form.usageCount),
      perCustomerLimit: form.perCustomerLimit === '' ? '' : Number(form.perCustomerLimit),
      minimumPassengers: form.minimumPassengers === '' ? '' : Number(form.minimumPassengers),
      createdDate: existing ? existing.createdDate : timestamp,
      updatedDate: timestamp,
    }
    setOffers((current) => editingId
      ? current.map((offer) => offer.id === editingId ? savedOffer : offer)
      : [savedOffer, ...current])
    firestoreSaveOffer(savedOffer).catch((err) => console.warn('Firestore offer save error:', err))
    closeForm()
    setPage(1)
    notify(editingId ? 'Offer updated successfully.' : `${savedOffer.id} added successfully.`)
  }

  const updateOffer = (id, changes, message) => {
    const timestamp = new Date().toISOString().slice(0, 19)
    const existing = offers.find((o) => o.id === id)
    if (existing) {
      firestoreSaveOffer({ ...existing, ...changes, updatedDate: timestamp }).catch((err) =>
        console.warn('Firestore offer update error:', err)
      )
    }
    setOffers((current) => current.map((offer) => offer.id === id
      ? { ...offer, ...changes, updatedDate: timestamp }
      : offer))
    notify(message)
  }

  const requestStatusChange = (offer, status) => {
    if (status === offer.status) return
    setStatusConfirmation({ offer, status })
  }

  const confirmStatusChange = () => {
    if (!statusConfirmation) return
    updateOffer(statusConfirmation.offer.id, { status: statusConfirmation.status }, `${statusConfirmation.offer.id} status set to ${statusConfirmation.status}.`)
    setStatusConfirmation(null)
  }

  const deleteOffer = () => {
    if (!deleteConfirmation) return
    const idToDelete = deleteConfirmation.id
    setOffers((current) => current.filter((offer) => offer.id !== idToDelete))
    firestoreDeleteOffer(idToDelete).catch((err) => console.warn('Firestore offer delete error:', err))
    setDeleteConfirmation(null)
    notify(`${idToDelete} deleted.`)
  }

  const changeSort = (key) => {
    setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc')
    setSortBy(key)
    setPage(1)
  }

  const copyCoupon = async (offer) => {
    try {
      await navigator.clipboard.writeText(offer.code)
      notify(`${offer.code} copied to clipboard.`)
    } catch (error) {
      notify('Could not copy coupon code. Check clipboard permissions and try again.')
    }
  }

  const exportCsv = () => {
    const headers = [
      'Offer ID', 'Offer name', 'Coupon code', 'Description', 'Discount type', 'Discount value',
      'Minimum booking amount', 'Maximum discount', 'Valid from', 'Valid until', 'Usage limit',
      'Usage count', 'Per-customer limit', 'Applicable service', 'Minimum passengers', 'Status',
      'Featured', 'Created date', 'Last updated date',
    ]
    const rows = filteredOffers.map((offer) => [
      offer.id, offer.name, offer.code, offer.description, offer.discountType, offer.discountValue,
      offer.minimumBookingAmount, offer.maximumDiscount, offer.validFrom, offer.validUntil,
      offer.usageLimit, offer.usageCount, offer.perCustomerLimit, offer.service,
      offer.minimumPassengers, effectiveStatus(offer), offer.featured ? 'Yes' : 'No',
      offer.createdDate, offer.updatedDate,
    ])
    saveCsv([headers, ...rows])
  }

  const sortOptions = [
    ['id', 'Offer ID'], ['name', 'Offer name'], ['code', 'Coupon code'],
    ['discountValue', 'Discount value'], ['minimumBookingAmount', 'Minimum booking amount'],
    ['validFrom', 'Valid from'], ['validUntil', 'Valid until'], ['usageCount', 'Usage count'], ['status', 'Status'],
  ]

  return <>
    <PageHeader title="Offers Management" description="Manage illustrative promotional offers, coupon codes and validity.">
      <div className="offers-page-actions">
        <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
        <button type="button" className="primary-button" onClick={openAddForm}><Plus size={14} />Add Offer</button>
      </div>
    </PageHeader>
    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Fictional demo offers</strong> — local illustrative records only; no booking, checkout or payment integration.</span></div>
    <section className="offers-summary-grid" aria-label="Offer summary">
      <SummaryCard label="Total Offers" value={summary.total} tone="blue" />
      <SummaryCard label="Active Offers" value={summary.active} tone="green" />
      <SummaryCard label="Scheduled Offers" value={summary.scheduled} tone="violet" />
      <SummaryCard label="Expired Offers" value={summary.expired} tone="slate" />
      <SummaryCard label="Demo Redemptions" value={summary.redemptions.toLocaleString('en-IN')} tone="amber" />
    </section>
    {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

    <section className="panel offers-management-panel">
      <div className="panel-heading offers-panel-heading">
        <div><h2>Offer directory</h2><p>Search coupon configurations, validity, usage and current availability.</p></div>
        <span className="vehicle-result-count">{filteredOffers.length} matching offers</span>
      </div>
      <div className="offers-filters">
        <label className="search-field offers-search"><Search size={15} /><input type="search" aria-label="Search offers" placeholder="Search ID, name, code or description..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
        <label className="filter-select"><select aria-label="Filter offers by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}>{['All statuses', 'Active', 'Inactive', 'Scheduled', 'Expired', 'Usage Limit Reached'].map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="filter-select"><select aria-label="Filter offers by discount type" value={discountFilter} onChange={(event) => { setDiscountFilter(event.target.value); setPage(1) }}>{['All discount types', ...offerDiscountTypes].map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="filter-select"><select aria-label="Filter featured offers" value={featuredFilter} onChange={(event) => { setFeaturedFilter(event.target.value); setPage(1) }}>{['All offers', 'Featured', 'Not featured'].map((featured) => <option key={featured}>{featured}</option>)}</select></label>
        <label className="filter-select"><select aria-label="Filter offers by applicable service" value={serviceFilter} onChange={(event) => { setServiceFilter(event.target.value); setPage(1) }}>{['Any service', ...offerServices].map((service) => <option key={service}>{service}</option>)}</select></label>
        <label className="filter-select offers-validity-filter"><span>Valid on</span><input aria-label="Filter offers valid on date" type="date" value={validOn} onChange={(event) => { setValidOn(event.target.value); setPage(1) }} /></label>
        <label className="filter-select"><select aria-label="Sort offers by" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setSortDirection('asc'); setPage(1) }}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="button" className="secondary-button offers-sort-direction" aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`} onClick={() => { setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
        <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear All Filters</button>
      </div>
      <div className="table-scroll offers-table-scroll">
        <table className="data-table offers-table">
          <thead><tr>
            <th><SortButton sortKey="id" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Offer ID</SortButton></th>
            <th><SortButton sortKey="name" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Offer name</SortButton></th>
            <th><SortButton sortKey="code" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Coupon code</SortButton></th>
            <th>Discount</th><th><SortButton sortKey="minimumBookingAmount" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Minimum</SortButton></th>
            <th><SortButton sortKey="validFrom" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Valid from</SortButton></th>
            <th><SortButton sortKey="validUntil" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Valid until</SortButton></th>
            <th><SortButton sortKey="usageCount" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Usage</SortButton></th>
            <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Status</SortButton></th>
            <th>Featured</th><th>Actions</th>
          </tr></thead>
          <tbody>{pageOffers.length ? pageOffers.map((offer) => {
            const currentStatus = effectiveStatus(offer)
            return <tr key={offer.id} className={`offers-status-row offers-row-${currentStatus.toLowerCase().replaceAll(' ', '-')}`}>
              <td className="offers-id-cell">{offer.id}</td>
              <td><div className="offers-name-cell"><strong>{offer.name}</strong><small>{offer.service}</small></div></td>
              <td><button type="button" className="offers-code-button" onClick={() => copyCoupon(offer)} aria-label={`Copy coupon code ${offer.code}`}>{offer.code}<Copy size={12} /></button></td>
              <td>{offer.discountType === 'Percentage' ? `${offer.discountValue}%${offer.maximumDiscount ? ` · max ${formatMoney(offer.maximumDiscount)}` : ''}` : formatMoney(offer.discountValue)}</td>
              <td>{formatMoney(offer.minimumBookingAmount)}</td>
              <td>{displayDate(offer.validFrom)}</td>
              <td>{displayDate(offer.validUntil)}</td>
              <td><span className="offers-usage-cell">{offer.usageCount} / {offer.usageLimit === '' || offer.usageLimit === null ? '∞' : offer.usageLimit}</span>{currentStatus === 'Usage Limit Reached' && <small className="offers-usage-full">Limit reached</small>}</td>
              <td className="offers-status-cell"><StatusBadge status={currentStatus} /><select className="offers-status-control" aria-label={`Set status for ${offer.id}`} value={offer.status} onChange={(event) => requestStatusChange(offer, event.target.value)}>{offerStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
              <td><button type="button" className={`offers-feature-button ${offer.featured ? 'is-featured' : ''}`} aria-label={`${offer.featured ? 'Remove featured from' : 'Feature'} ${offer.id}`} aria-pressed={offer.featured} onClick={() => updateOffer(offer.id, { featured: !offer.featured }, `${offer.id} ${offer.featured ? 'removed from' : 'marked as'} featured.`)}><Star size={14} fill={offer.featured ? 'currentColor' : 'none'} />{offer.featured ? 'Featured' : 'No'}</button></td>
              <td className="offers-actions-cell">
                <button className="table-action-button" type="button" aria-label={`View ${offer.id}`} onClick={() => { setSelectedId(offer.id); setDetailSampleAmount(String(offer.minimumBookingAmount || 5000)) }}><Eye size={15} /></button>
                <button className="table-action-button" type="button" aria-label={`Edit ${offer.id}`} onClick={() => openEditForm(offer)}><Edit3 size={15} /></button>
                <button className="table-action-button danger-button" type="button" aria-label={`Delete ${offer.id}`} onClick={() => setDeleteConfirmation(offer)}><Trash2 size={15} /></button>
              </td>
            </tr>
          }) : <tr><td colSpan="11"><div className="empty-state offers-empty-state"><Search size={20} /><strong>No offers found</strong><span>Adjust your search or filters, or clear all filters to see the offer list.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>}</tbody>
        </table>
      </div>
      <div className="pagination-row offers-pagination">
        <span className="pagination-count">Showing {filteredOffers.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredOffers.length)} of {filteredOffers.length}</span>
        <label className="page-size-control">Rows per page<select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <button type="button" className="secondary-button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" className="secondary-button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
      </div>
    </section>

    {selectedOffer && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedId('')}>
      <section className="offers-details-modal" role="dialog" aria-modal="true" aria-labelledby="offers-details-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">OFFER DETAILS</span><h2 id="offers-details-title">{selectedOffer.id}</h2><p className="offers-detail-subtitle">{selectedOffer.name}</p></div><button className="icon-button" type="button" aria-label="Close offer details" onClick={() => setSelectedId('')}><X size={18} /></button></div>
        <div className="offers-detail-status"><StatusBadge status={effectiveStatus(selectedOffer)} /><label className="offers-detail-status-control">Manual status<select aria-label="Offer details status" value={selectedOffer.status} onChange={(event) => requestStatusChange(selectedOffer, event.target.value)}>{offerStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><button type="button" className={`offers-feature-button ${selectedOffer.featured ? 'is-featured' : ''}`} aria-pressed={selectedOffer.featured} onClick={() => updateOffer(selectedOffer.id, { featured: !selectedOffer.featured }, `${selectedOffer.id} ${selectedOffer.featured ? 'removed from' : 'marked as'} featured.`)}><Star size={14} fill={selectedOffer.featured ? 'currentColor' : 'none'} />{selectedOffer.featured ? 'Remove featured' : 'Mark featured'}</button></div>
        <section className="offers-detail-section"><h3>Offer configuration</h3><div className="offers-detail-grid">
          <DetailItem label="Offer name">{selectedOffer.name}</DetailItem>
          <DetailItem label="Coupon code"><span className="offers-detail-code">{selectedOffer.code}<button type="button" className="table-action-button" aria-label={`Copy coupon code ${selectedOffer.code}`} onClick={() => copyCoupon(selectedOffer)}><Copy size={14} /></button></span></DetailItem>
          <DetailItem label="Discount">{selectedOffer.discountType === 'Percentage' ? `${selectedOffer.discountValue}%` : formatMoney(selectedOffer.discountValue)}</DetailItem>
          <DetailItem label="Minimum booking amount">{formatMoney(selectedOffer.minimumBookingAmount)}</DetailItem>
          <DetailItem label="Maximum discount">{selectedOffer.maximumDiscount ? formatMoney(selectedOffer.maximumDiscount) : 'Not applicable'}</DetailItem>
          <DetailItem label="Applicable service">{selectedOffer.service}</DetailItem>
          <DetailItem label="Valid from">{displayDate(selectedOffer.validFrom)}</DetailItem>
          <DetailItem label="Valid until">{displayDate(selectedOffer.validUntil)}</DetailItem>
          <DetailItem label="Usage count / limit">{selectedOffer.usageCount} / {selectedOffer.usageLimit === '' || selectedOffer.usageLimit === null ? 'Unlimited' : selectedOffer.usageLimit}</DetailItem>
          <DetailItem label="Per-customer limit">{selectedOffer.perCustomerLimit || 'Unlimited'}</DetailItem>
          <DetailItem label="Minimum passengers">{selectedOffer.minimumPassengers || 'No minimum'}</DetailItem>
        </div></section>
        <section className="offers-detail-section"><h3>Description</h3><p className="offers-description">{selectedOffer.description || 'No description provided.'}</p></section>
        <DiscountPreview offer={selectedOffer} sampleAmount={detailSampleAmount} onSampleAmountChange={setDetailSampleAmount} />
        <div className="offers-detail-dates"><DetailItem label="Created">{displayDateTime(selectedOffer.createdDate)}</DetailItem><DetailItem label="Last updated">{displayDateTime(selectedOffer.updatedDate)}</DetailItem></div>
        <div className="offers-modal-actions"><button type="button" className="secondary-button" onClick={() => openEditForm(selectedOffer)}>Edit offer</button><button type="button" className="primary-button" onClick={() => setSelectedId('')}>Done</button></div>
      </section>
    </div>}

    {formOpen && <div className="modal-backdrop" role="presentation" onClick={closeForm}>
      <section className="offers-form-modal" role="dialog" aria-modal="true" aria-labelledby="offers-form-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">{editingId ? 'UPDATE OFFER' : 'DEMO OFFER'}</span><h2 id="offers-form-title">{editingId ? `Edit ${editingId}` : 'Add Offer'}</h2><p className="offers-detail-subtitle">Configure a local promotional offer for demonstration.</p></div><button className="icon-button" type="button" aria-label="Close offer form" onClick={closeForm}><X size={18} /></button></div>
        <form className="offers-form" onSubmit={submitForm} noValidate>
          <fieldset className="offers-form-section"><legend>Offer configuration</legend><div className="offers-form-grid">
            <FormField label="Offer name" name="name" value={form.name} onChange={updateForm} error={errors.name} required />
            <FormField label="Coupon / promo code" name="code" value={form.code} onChange={updateForm} error={errors.code} required placeholder="e.g. RIDE15" />
            <FormField label="Discount type" name="discountType" value={form.discountType} onChange={updateForm} error={errors.discountType} options={offerDiscountTypes} required />
            <FormField label={form.discountType === 'Percentage' ? 'Discount percentage' : 'Fixed discount amount'} name="discountValue" type="number" value={form.discountValue} onChange={updateForm} error={errors.discountValue} required min="0.01" step="0.01" />
            <FormField label="Minimum booking amount" name="minimumBookingAmount" type="number" value={form.minimumBookingAmount} onChange={updateForm} error={errors.minimumBookingAmount} required min="0" step="0.01" />
            {form.discountType === 'Percentage' && <FormField label="Maximum discount amount (optional)" name="maximumDiscount" type="number" value={form.maximumDiscount} onChange={updateForm} error={errors.maximumDiscount} min="0.01" step="0.01" />}
            <FormField label="Valid from" name="validFrom" type="date" value={form.validFrom} onChange={updateForm} error={errors.validFrom} required />
            <FormField label="Valid until" name="validUntil" type="date" value={form.validUntil} onChange={updateForm} error={errors.validUntil} required />
            <FormField label="Usage limit (optional)" name="usageLimit" type="number" value={form.usageLimit} onChange={updateForm} error={errors.usageLimit} min="1" step="1" placeholder="Unlimited" />
            <FormField label="Current demo usage count" name="usageCount" type="number" value={form.usageCount} onChange={updateForm} error={errors.usageCount} min="0" step="1" />
            <FormField label="Per-customer limit (optional)" name="perCustomerLimit" type="number" value={form.perCustomerLimit} onChange={updateForm} error={errors.perCustomerLimit} min="1" step="1" placeholder="Unlimited" />
            <FormField label="Applicable service / trip type" name="service" value={form.service} onChange={updateForm} error={errors.service} options={offerServices} required />
            <FormField label="Minimum passengers (optional)" name="minimumPassengers" type="number" value={form.minimumPassengers} onChange={updateForm} error={errors.minimumPassengers} min="1" step="1" />
            <FormField label="Status" name="status" value={form.status} onChange={updateForm} error={errors.status} options={offerStatuses} required />
            <label className="offers-feature-control"><input name="featured" type="checkbox" checked={form.featured} onChange={updateForm} />Feature this offer</label>
            <FormField label="Description" name="description" type="textarea" value={form.description} onChange={updateForm} wide placeholder="Optional offer details" />
          </div></fieldset>
          <DiscountPreview offer={form} sampleAmount={form.sampleBookingAmount} onSampleAmountChange={(value) => setForm((current) => ({ ...current, sampleBookingAmount: value }))} />
          {errors.sampleBookingAmount && <small className="field-error">{errors.sampleBookingAmount}</small>}
          <div className="offers-modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add offer'}</button></div>
        </form>
      </section>
    </div>}

    {statusConfirmation && <div className="modal-backdrop" role="presentation" onClick={() => setStatusConfirmation(null)}>
      <section className="offers-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="offers-status-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">STATUS CHANGE</span><h2 id="offers-status-title">Change offer status?</h2></div><button className="icon-button" type="button" aria-label="Close status confirmation" onClick={() => setStatusConfirmation(null)}><X size={18} /></button></div>
        <p>Set <strong>{statusConfirmation.offer.id}</strong> to <strong>{statusConfirmation.status}</strong>? Date validity and usage limits will still determine its effective status.</p>
        <div className="offers-modal-actions"><button type="button" className="secondary-button" onClick={() => setStatusConfirmation(null)}>Cancel</button><button type="button" className="primary-button" onClick={confirmStatusChange}>Confirm status</button></div>
      </section>
    </div>}

    {deleteConfirmation && <div className="modal-backdrop" role="presentation" onClick={() => setDeleteConfirmation(null)}>
      <section className="offers-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="offers-delete-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">DELETE OFFER</span><h2 id="offers-delete-title">Delete this offer?</h2></div><button className="icon-button" type="button" aria-label="Close delete confirmation" onClick={() => setDeleteConfirmation(null)}><X size={18} /></button></div>
        <p><strong>{deleteConfirmation.id} — {deleteConfirmation.name}</strong> will be removed from the local demo list.</p>
        <div className="offers-modal-actions"><button type="button" className="secondary-button" onClick={() => setDeleteConfirmation(null)}>Cancel</button><button type="button" className="primary-button destructive-confirm-button" onClick={deleteOffer}>Delete offer</button></div>
      </section>
    </div>}
  </>
}
