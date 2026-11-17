import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, Copy, Download, Edit3, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import {
  enquiryPriorities,
  enquirySources,
  enquiryStatuses,
  enquiryTypes,
  enquiryVehicles,
  mockEnquiries,
} from '../data/mockEnquiries.js'
import {
  subscribeEnquiries,
  saveEnquiry as firestoreSaveEnquiry,
  updateEnquiryStatus as firestoreUpdateEnquiryStatus,
  deleteEnquiry as firestoreDeleteEnquiry,
} from '../services/adminFirestoreService.js'

const pageSizes = [10, 20, 50]
const emptyEnquiry = {
  customerName: '', phone: '', email: '', type: '', subject: '', message: '',
  pickup: '', drop: '', travelDate: '', passengerCount: '', preferredVehicle: '',
  estimatedBudget: '', source: 'Website', priority: 'Normal', status: 'New',
  assignedAdmin: 'Suraj Patil', adminNotes: '', followUpDate: '',
}
const priorityOrder = { Low: 1, Normal: 2, High: 3, Urgent: 4 }
const statusTone = { New: 'blue', 'In Progress': 'amber', Responded: 'green', Closed: 'slate', 'Not Relevant': 'red' }
const priorityTone = { Low: 'slate', Normal: 'blue', High: 'amber', Urgent: 'red' }

function isValidIndianPhone(value) {
  const normalized = value.trim().replace(/[\s()-]/g, '').replace(/^(?:\+91|91|0)/, '')
  return /^[6-9]\d{9}$/.test(normalized)
}

function dateInputValue(value = '') {
  if (!value) return ''
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match ? match[1] : ''
}

function isValidDate(value) {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function displayDate(value) {
  if (!value) return '—'
  const normalized = dateInputValue(value)
  if (!normalized || !isValidDate(normalized)) return value
  const [year, month, day] = normalized.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day))
}

function displayDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function formatMoney(value) {
  if (value === '' || value === null || value === undefined) return '—'
  return `₹${Number(value).toLocaleString('en-IN')}`
}

function saveCsv(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'enquiries-export.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function createEnquiryId(enquiries) {
  const ids = new Set(enquiries.map((enquiry) => enquiry.id))
  const largest = enquiries.reduce((value, enquiry) => {
    const match = /^ENQ-2026-(\d+)$/.exec(enquiry.id)
    return match ? Math.max(value, Number(match[1])) : value
  }, 1000)
  let next = largest + 1
  while (ids.has(`ENQ-2026-${next}`)) next += 1
  return `ENQ-2026-${next}`
}

function SummaryCard({ label, value, tone }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong></div>
}

function FilterControl({ label, value, options, onChange }) {
  return <label className="filter-select"><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  return <button type="button" className={`enquiries-sort-button ${sortBy === sortKey ? 'enquiries-sort-active' : ''}`} onClick={() => onClick(sortKey)} aria-label={`Sort by ${children}, ${sortBy === sortKey && direction === 'asc' ? 'descending' : 'ascending'}`}>
    {children}<ArrowUpDown size={11} />
  </button>
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${statusTone[status] || 'slate'}`}>{status}</span>
}

function PriorityBadge({ priority }) {
  return <span className={`enquiry-priority-badge enquiry-priority-${priorityTone[priority] || 'slate'}`}>{priority}</span>
}

function FormField({ label, name, value, onChange, error, type = 'text', required = false, options, placeholder, wide = false, rows = 3, min, step }) {
  const errorId = `enquiry-error-${name}`
  return <label className={`enquiry-form-field${wide ? ' enquiry-form-wide' : ''}`}>
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    {options
      ? <select name={name} value={value} onChange={onChange} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
        <option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      : type === 'textarea'
        ? <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        : <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} step={step} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />}
    {error && <small id={errorId} className="field-error">{error}</small>}
  </label>
}

function DetailItem({ label, children }) {
  return <div className="enquiry-detail-item"><small>{label}</small><strong>{children || '—'}</strong></div>
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState(mockEnquiries)

  // Subscribe to real-time Firestore customer enquiries
  useEffect(() => {
    const unsubscribe = subscribeEnquiries((firestoreEnquiries) => {
      if (firestoreEnquiries && firestoreEnquiries.length > 0) {
        setEnquiries(firestoreEnquiries)
      }
    })
    return () => unsubscribe()
  }, [])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [typeFilter, setTypeFilter] = useState('All enquiry types')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [sourceFilter, setSourceFilter] = useState('All sources')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('createdDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyEnquiry)
  const [errors, setErrors] = useState({})
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [statusConfirmation, setStatusConfirmation] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [toast, setToast] = useState('')

  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const phoneQuery = query.replace(/\D/g, '')
    return enquiries.filter((enquiry) => {
      const searchFields = [enquiry.id, enquiry.customerName, enquiry.phone, enquiry.email, enquiry.subject, enquiry.message]
      const matchesSearch = !query || searchFields.some((value) => String(value || '').toLocaleLowerCase().includes(query))
        || (phoneQuery.length > 0 && enquiry.phone.replace(/\D/g, '').includes(phoneQuery))
      const createdDate = dateInputValue(enquiry.createdDate)
      return matchesSearch
        && (statusFilter === 'All statuses' || enquiry.status === statusFilter)
        && (typeFilter === 'All enquiry types' || enquiry.type === typeFilter)
        && (priorityFilter === 'All priorities' || enquiry.priority === priorityFilter)
        && (sourceFilter === 'All sources' || enquiry.source === sourceFilter)
        && (!dateFrom || createdDate >= dateFrom)
        && (!dateTo || createdDate <= dateTo)
    }).sort((first, second) => {
      let comparison
      if (sortBy === 'priority') comparison = priorityOrder[first.priority] - priorityOrder[second.priority]
      else if (sortBy === 'createdDate' || sortBy === 'travelDate') {
        const firstDate = dateInputValue(first[sortBy])
        const secondDate = dateInputValue(second[sortBy])
        if (!firstDate) return secondDate ? 1 : 0
        if (!secondDate) return -1
        comparison = firstDate.localeCompare(secondDate)
      } else comparison = String(first[sortBy] || '').localeCompare(String(second[sortBy] || ''), 'en', { sensitivity: 'base', numeric: true })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [dateFrom, dateTo, enquiries, priorityFilter, search, sortBy, sortDirection, sourceFilter, statusFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageEnquiries = filteredEnquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const summary = useMemo(() => ({
    total: enquiries.length,
    newCount: enquiries.filter((enquiry) => enquiry.status === 'New').length,
    inProgress: enquiries.filter((enquiry) => enquiry.status === 'In Progress').length,
    responded: enquiries.filter((enquiry) => enquiry.status === 'Responded').length,
    closed: enquiries.filter((enquiry) => enquiry.status === 'Closed').length,
  }), [enquiries])

  useEffect(() => {
    if (!(formOpen || selectedEnquiry || statusConfirmation || deleteConfirmation)) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFormOpen(false)
        setSelectedEnquiry(null)
        setStatusConfirmation(null)
        setDeleteConfirmation(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleteConfirmation, formOpen, selectedEnquiry, statusConfirmation])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All statuses')
    setTypeFilter('All enquiry types')
    setPriorityFilter('All priorities')
    setSourceFilter('All sources')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const openAddForm = () => {
    setEditingId('')
    setForm({ ...emptyEnquiry })
    setErrors({})
    setSelectedEnquiry(null)
    setFormOpen(true)
  }

  const openEditForm = (enquiry) => {
    setEditingId(enquiry.id)
    setForm({ ...enquiry, travelDate: dateInputValue(enquiry.travelDate), followUpDate: dateInputValue(enquiry.followUpDate) })
    setErrors({})
    setSelectedEnquiry(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyEnquiry })
    setErrors({})
  }

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: ['passengerCount', 'estimatedBudget'].includes(name) && value !== '' ? Number(value) : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submitForm = (event) => {
    event.preventDefault()
    const validation = {}
    if (!form.customerName.trim()) validation.customerName = 'Enter the customer name.'
    if (!form.phone.trim()) validation.phone = 'Enter the customer phone number.'
    else if (!isValidIndianPhone(form.phone)) validation.phone = 'Enter a valid Indian mobile number (10 digits, starting 6–9).'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) validation.email = 'Enter a valid email address.'
    if (!form.type) validation.type = 'Select an enquiry type.'
    if (!form.subject.trim()) validation.subject = 'Enter a subject.'
    if (!form.message.trim()) validation.message = 'Enter the customer message.'
    if (form.passengerCount !== '' && (!Number.isInteger(Number(form.passengerCount)) || Number(form.passengerCount) <= 0)) validation.passengerCount = 'Passenger count must be a positive whole number.'
    if (form.estimatedBudget !== '' && (!Number.isFinite(Number(form.estimatedBudget)) || Number(form.estimatedBudget) < 0)) validation.estimatedBudget = 'Budget must be a valid non-negative amount.'
    if (!isValidDate(form.travelDate)) validation.travelDate = 'Enter a valid travel date.'
    if (!isValidDate(form.followUpDate)) validation.followUpDate = 'Enter a valid follow-up date.'
    setErrors(validation)
    if (Object.keys(validation).length) return

    const now = new Date().toISOString().slice(0, 19)
    const saved = {
      ...form,
      id: editingId || createEnquiryId(enquiries),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      pickup: form.pickup.trim(),
      drop: form.drop.trim(),
      passengerCount: form.passengerCount === '' ? '' : Number(form.passengerCount),
      estimatedBudget: form.estimatedBudget === '' ? '' : Number(form.estimatedBudget),
      assignedAdmin: form.assignedAdmin.trim(),
      adminNotes: form.adminNotes.trim(),
      createdDate: editingId ? enquiries.find((enquiry) => enquiry.id === editingId).createdDate : now,
      lastUpdatedDate: now,
    }
    setEnquiries((current) => editingId
      ? current.map((enquiry) => enquiry.id === editingId ? saved : enquiry)
      : [saved, ...current])
    firestoreSaveEnquiry(saved).catch((err) => console.warn('Firestore enquiry save error:', err))
    closeForm()
    setPage(1)
    notify(editingId ? 'Enquiry updated successfully.' : `${saved.id} added successfully.`)
  }

  const applyStatus = () => {
    if (!statusConfirmation) return
    const { enquiry, status } = statusConfirmation
    const updatedAt = new Date().toISOString().slice(0, 19)
    setEnquiries((current) => current.map((item) => item.id === enquiry.id ? { ...item, status, lastUpdatedDate: updatedAt } : item))
    firestoreUpdateEnquiryStatus(enquiry.id, status).catch((err) => console.warn('Firestore enquiry status error:', err))
    setStatusConfirmation(null)
    notify(`${enquiry.id} marked ${status}.`)
  }

  const deleteEnquiry = () => {
    if (!deleteConfirmation) return
    const deletedName = deleteConfirmation.customerName
    setEnquiries((current) => current.filter((enquiry) => enquiry.id !== deleteConfirmation.id))
    firestoreDeleteEnquiry(deleteConfirmation.id).catch((err) => console.warn('Firestore enquiry delete error:', err))
    setPage((current) => Math.max(1, Math.min(current, Math.ceil(Math.max(0, filteredEnquiries.length - 1) / pageSize))))
    setDeleteConfirmation(null)
    notify(`Enquiry from ${deletedName} deleted.`)
  }

  const changeSort = (key) => {
    setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc')
    setSortBy(key)
    setPage(1)
  }

  const copyValue = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      notify(`${label} copied.`)
    } catch {
      notify(`Could not copy ${label.toLowerCase()}. Use your device's copy controls.`)
    }
  }

  const exportCsv = () => {
    const headers = [
      'Enquiry ID', 'Customer name', 'Phone', 'Email', 'Enquiry type', 'Subject', 'Message',
      'Pickup location', 'Drop location', 'Travel date', 'Passenger count', 'Preferred vehicle',
      'Estimated budget', 'Source', 'Priority', 'Status', 'Assigned admin', 'Admin notes',
      'Created date', 'Last updated date', 'Follow-up date',
    ]
    const rows = filteredEnquiries.map((enquiry) => [
      enquiry.id, enquiry.customerName, enquiry.phone, enquiry.email, enquiry.type, enquiry.subject,
      enquiry.message, enquiry.pickup, enquiry.drop, enquiry.travelDate, enquiry.passengerCount,
      enquiry.preferredVehicle, enquiry.estimatedBudget, enquiry.source, enquiry.priority,
      enquiry.status, enquiry.assignedAdmin, enquiry.adminNotes, enquiry.createdDate,
      enquiry.lastUpdatedDate, enquiry.followUpDate,
    ])
    saveCsv([headers, ...rows])
  }

  const sortOptions = [
    ['id', 'Enquiry ID'], ['customerName', 'Customer name'], ['createdDate', 'Created date'],
    ['travelDate', 'Travel date'], ['priority', 'Priority'], ['status', 'Status'],
  ]

  return <>
    <PageHeader title="Enquiries Management" description="Manage customer enquiries, respond to requests and track follow-up status.">
      <div className="enquiries-page-actions">
        <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
        <button type="button" className="primary-button" onClick={openAddForm}><Plus size={14} />Add Enquiry</button>
      </div>
    </PageHeader>
    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Demo enquiry data</strong> — all customer records and contact details are fictional sample data.</span></div>
    <section className="enquiries-summary-grid" aria-label="Enquiry summary">
      <SummaryCard label="Total Enquiries" value={summary.total} tone="blue" />
      <SummaryCard label="New Enquiries" value={summary.newCount} tone="violet" />
      <SummaryCard label="In Progress" value={summary.inProgress} tone="amber" />
      <SummaryCard label="Responded" value={summary.responded} tone="green" />
      <SummaryCard label="Closed" value={summary.closed} tone="slate" />
    </section>
    {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

    <section className="panel enquiries-management-panel">
      <div className="panel-heading enquiries-panel-heading">
        <div><h2>Customer enquiries</h2><p>Search, prioritize and track customer requests and follow-ups.</p></div>
        <span className="vehicle-result-count">{filteredEnquiries.length} matching enquiries</span>
      </div>
      <div className="enquiries-filters">
        <label className="search-field enquiries-search"><Search size={15} /><input type="search" aria-label="Search enquiries" placeholder="Search ID, customer, phone, email, subject or message..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
        <FilterControl label="Filter enquiries by status" value={statusFilter} options={['All statuses', ...enquiryStatuses]} onChange={(value) => { setStatusFilter(value); setPage(1) }} />
        <FilterControl label="Filter enquiries by type" value={typeFilter} options={['All enquiry types', ...enquiryTypes]} onChange={(value) => { setTypeFilter(value); setPage(1) }} />
        <FilterControl label="Filter enquiries by priority" value={priorityFilter} options={['All priorities', ...enquiryPriorities]} onChange={(value) => { setPriorityFilter(value); setPage(1) }} />
        <FilterControl label="Filter enquiries by source" value={sourceFilter} options={['All sources', ...enquirySources]} onChange={(value) => { setSourceFilter(value); setPage(1) }} />
        <label className="filter-select enquiry-date-filter"><span>From</span><input aria-label="Created from date" type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} /></label>
        <label className="filter-select enquiry-date-filter"><span>To</span><input aria-label="Created to date" type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} /></label>
        <label className="filter-select"><select aria-label="Sort enquiries by" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setSortDirection('asc'); setPage(1) }}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="button" className="secondary-button enquiries-sort-direction" aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`} onClick={() => { setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
        <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear All Filters</button>
      </div>
      <div className="table-scroll enquiries-table-scroll">
        <table className="data-table enquiries-table">
          <thead><tr>
            <th><SortButton sortKey="id" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Enquiry ID</SortButton></th>
            <th><SortButton sortKey="customerName" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Customer</SortButton></th>
            <th>Subject / type</th>
            <th><SortButton sortKey="travelDate" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Travel date</SortButton></th>
            <th><SortButton sortKey="priority" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Priority</SortButton></th>
            <th>Source</th>
            <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Status</SortButton></th>
            <th><SortButton sortKey="createdDate" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Created</SortButton></th>
            <th>Actions</th>
          </tr></thead>
          <tbody>{pageEnquiries.length ? pageEnquiries.map((enquiry) => <tr key={enquiry.id}>
            <td className="enquiry-id-cell">{enquiry.id}</td>
            <td><div className="enquiry-customer-cell"><strong>{enquiry.customerName}</strong><small>{enquiry.phone}</small></div></td>
            <td><div className="enquiry-subject-cell"><strong>{enquiry.subject}</strong><small>{enquiry.type}</small></div></td>
            <td>{displayDate(enquiry.travelDate)}</td>
            <td><PriorityBadge priority={enquiry.priority} /></td>
            <td>{enquiry.source}</td>
            <td><StatusBadge status={enquiry.status} /></td>
            <td>{displayDate(enquiry.createdDate)}</td>
            <td className="enquiry-actions-cell">
              <button className="table-action-button" type="button" aria-label={`View ${enquiry.id}`} onClick={() => setSelectedEnquiry(enquiry)}><Eye size={15} /></button>
              <button className="table-action-button" type="button" aria-label={`Edit ${enquiry.id}`} onClick={() => openEditForm(enquiry)}><Edit3 size={15} /></button>
              <button className="table-action-button" type="button" aria-label={`Change status for ${enquiry.id}`} onClick={() => setStatusConfirmation({ enquiry, status: enquiry.status })}><ArrowUpDown size={15} /></button>
              <button className="table-action-button danger-button" type="button" aria-label={`Delete ${enquiry.id}`} onClick={() => setDeleteConfirmation(enquiry)}><Trash2 size={15} /></button>
            </td>
          </tr>) : <tr><td colSpan="9"><div className="empty-state enquiries-empty-state"><Search size={20} /><strong>No enquiries found</strong><span>Adjust your search or filters, or clear all filters to see the full enquiry list.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>}</tbody>
        </table>
      </div>
      <div className="pagination-row enquiries-pagination">
        <span className="pagination-count">Showing {filteredEnquiries.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredEnquiries.length)} of {filteredEnquiries.length}</span>
        <label className="page-size-control">Rows per page<select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <button type="button" className="secondary-button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" className="secondary-button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
      </div>
    </section>

    {selectedEnquiry && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedEnquiry(null)}>
      <section className="enquiries-details-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-details-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">ENQUIRY DETAILS</span><h2 id="enquiry-details-title">{selectedEnquiry.id}</h2><p className="enquiry-detail-subtitle">{selectedEnquiry.subject}</p></div><button className="icon-button" type="button" aria-label="Close enquiry details" onClick={() => setSelectedEnquiry(null)}><X size={18} /></button></div>
        <div className="enquiry-detail-status"><StatusBadge status={selectedEnquiry.status} /><PriorityBadge priority={selectedEnquiry.priority} /></div>
        <section className="enquiry-detail-section"><h3>Customer Information</h3><div className="enquiry-detail-grid">
          <DetailItem label="Name">{selectedEnquiry.customerName}</DetailItem>
          <div className="enquiry-detail-item"><small>Phone</small><div className="enquiry-contact-line"><strong>{selectedEnquiry.phone}</strong><button type="button" className="enquiry-copy-button" aria-label="Copy phone number" onClick={() => copyValue('Phone number', selectedEnquiry.phone)}><Copy size={13} />Copy</button></div></div>
          <div className="enquiry-detail-item"><small>Email</small><div className="enquiry-contact-line"><strong>{selectedEnquiry.email || '—'}</strong>{selectedEnquiry.email && <button type="button" className="enquiry-copy-button" aria-label="Copy email address" onClick={() => copyValue('Email address', selectedEnquiry.email)}><Copy size={13} />Copy</button>}</div></div>
        </div></section>
        <section className="enquiry-detail-section"><h3>Enquiry Information</h3><div className="enquiry-detail-grid">
          <DetailItem label="Type">{selectedEnquiry.type}</DetailItem><DetailItem label="Source">{selectedEnquiry.source}</DetailItem>
          <DetailItem label="Subject">{selectedEnquiry.subject}</DetailItem><DetailItem label="Message">{selectedEnquiry.message}</DetailItem>
        </div></section>
        <section className="enquiry-detail-section"><h3>Travel Information</h3><div className="enquiry-detail-grid">
          <DetailItem label="Pickup">{selectedEnquiry.pickup}</DetailItem><DetailItem label="Drop">{selectedEnquiry.drop}</DetailItem>
          <DetailItem label="Travel date">{displayDate(selectedEnquiry.travelDate)}</DetailItem>
          <DetailItem label="Passenger count">{selectedEnquiry.passengerCount}</DetailItem>
          <DetailItem label="Preferred vehicle">{selectedEnquiry.preferredVehicle}</DetailItem>
          <DetailItem label="Estimated budget">{selectedEnquiry.estimatedBudget === '' ? '—' : formatMoney(selectedEnquiry.estimatedBudget)}</DetailItem>
        </div></section>
        <section className="enquiry-detail-section"><h3>Admin Information</h3><div className="enquiry-detail-grid">
          <DetailItem label="Assigned admin">{selectedEnquiry.assignedAdmin}</DetailItem>
          <DetailItem label="Follow-up date">{displayDate(selectedEnquiry.followUpDate)}</DetailItem>
          <DetailItem label="Created">{displayDateTime(selectedEnquiry.createdDate)}</DetailItem>
          <DetailItem label="Last updated">{displayDateTime(selectedEnquiry.lastUpdatedDate)}</DetailItem>
        </div><div className="enquiry-internal-notes"><small>Internal admin notes (not customer-facing)</small><p>{selectedEnquiry.adminNotes || 'No internal notes.'}</p></div></section>
        <div className="enquiry-modal-actions"><button type="button" className="secondary-button" onClick={() => openEditForm(selectedEnquiry)}>Edit enquiry</button><button type="button" className="primary-button" onClick={() => setSelectedEnquiry(null)}>Done</button></div>
      </section>
    </div>}

    {formOpen && <div className="modal-backdrop" role="presentation" onClick={closeForm}>
      <section className="enquiries-form-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-form-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">{editingId ? 'UPDATE ENQUIRY' : 'NEW ENQUIRY'}</span><h2 id="enquiry-form-title">{editingId ? `Edit ${editingId}` : 'Add enquiry'}</h2><p className="enquiry-detail-subtitle">Maintain enquiry and internal follow-up information.</p></div><button className="icon-button" type="button" aria-label="Close enquiry form" onClick={closeForm}><X size={18} /></button></div>
        <form className="enquiries-form" onSubmit={submitForm} noValidate>
          <fieldset className="enquiry-form-section"><legend>Customer and Enquiry</legend><div className="enquiries-form-grid">
            <FormField label="Customer name" name="customerName" value={form.customerName} onChange={updateForm} error={errors.customerName} required />
            <FormField label="Phone number" name="phone" value={form.phone} onChange={updateForm} error={errors.phone} placeholder="+91 98765 43210" required />
            <FormField label="Email (optional)" name="email" type="email" value={form.email} onChange={updateForm} error={errors.email} />
            <FormField label="Enquiry type" name="type" value={form.type} onChange={updateForm} error={errors.type} options={enquiryTypes} required />
            <FormField label="Subject" name="subject" value={form.subject} onChange={updateForm} error={errors.subject} required wide />
            <FormField label="Customer message" name="message" type="textarea" value={form.message} onChange={updateForm} error={errors.message} required wide rows={4} />
          </div></fieldset>
          <fieldset className="enquiry-form-section"><legend>Travel Information</legend><div className="enquiries-form-grid">
            <FormField label="Pickup location" name="pickup" value={form.pickup} onChange={updateForm} />
            <FormField label="Drop location" name="drop" value={form.drop} onChange={updateForm} />
            <FormField label="Travel date" name="travelDate" type="date" value={form.travelDate} onChange={updateForm} error={errors.travelDate} />
            <FormField label="Passenger count" name="passengerCount" type="number" value={form.passengerCount} onChange={updateForm} error={errors.passengerCount} min="1" step="1" />
            <FormField label="Preferred vehicle" name="preferredVehicle" value={form.preferredVehicle} onChange={updateForm} options={enquiryVehicles} />
            <FormField label="Estimated budget (₹)" name="estimatedBudget" type="number" value={form.estimatedBudget} onChange={updateForm} error={errors.estimatedBudget} min="0" step="1" />
          </div></fieldset>
          <fieldset className="enquiry-form-section"><legend>Administration and Follow-up</legend><div className="enquiries-form-grid">
            <FormField label="Source" name="source" value={form.source} onChange={updateForm} options={enquirySources} required />
            <FormField label="Priority" name="priority" value={form.priority} onChange={updateForm} options={enquiryPriorities} required />
            <FormField label="Status" name="status" value={form.status} onChange={updateForm} options={enquiryStatuses} required />
            <FormField label="Assigned admin" name="assignedAdmin" value={form.assignedAdmin} onChange={updateForm} />
            <FormField label="Follow-up date" name="followUpDate" type="date" value={form.followUpDate} onChange={updateForm} error={errors.followUpDate} />
            <FormField label="Internal admin notes" name="adminNotes" type="textarea" value={form.adminNotes} onChange={updateForm} wide rows={3} />
          </div></fieldset>
          <div className="enquiry-modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add enquiry'}</button></div>
        </form>
      </section>
    </div>}

    {statusConfirmation && <div className="modal-backdrop" role="presentation" onClick={() => setStatusConfirmation(null)}>
      <section className="enquiries-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-status-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">UPDATE STATUS</span><h2 id="enquiry-status-title">Change enquiry status</h2></div><button className="icon-button" type="button" aria-label="Close status dialog" onClick={() => setStatusConfirmation(null)}><X size={18} /></button></div>
        <p>Choose the new status for <strong>{statusConfirmation.enquiry.id}</strong>. This updates the enquiry summary counts.</p>
        <label className="enquiry-status-choice">Status<select aria-label="New enquiry status" value={statusConfirmation.status} onChange={(event) => setStatusConfirmation((current) => ({ ...current, status: event.target.value }))}>{enquiryStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <div className="enquiry-modal-actions"><button type="button" className="secondary-button" onClick={() => setStatusConfirmation(null)}>Cancel</button><button type="button" className="primary-button" onClick={applyStatus}>Confirm status</button></div>
      </section>
    </div>}

    {deleteConfirmation && <div className="modal-backdrop" role="presentation" onClick={() => setDeleteConfirmation(null)}>
      <section className="enquiries-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="enquiry-delete-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">DELETE ENQUIRY</span><h2 id="enquiry-delete-title">Delete this enquiry?</h2></div><button className="icon-button" type="button" aria-label="Close delete confirmation" onClick={() => setDeleteConfirmation(null)}><X size={18} /></button></div>
        <p>This will permanently remove the enquiry from local demo data. The action cannot be undone.</p>
        <div className="enquiry-modal-actions"><button type="button" className="secondary-button" onClick={() => setDeleteConfirmation(null)}>Cancel</button><button type="button" className="primary-button enquiry-delete-confirm" onClick={deleteEnquiry}>Delete enquiry</button></div>
      </section>
    </div>}
  </>
}
