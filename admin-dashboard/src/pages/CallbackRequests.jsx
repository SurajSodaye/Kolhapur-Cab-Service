import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, Copy, Download, Edit3, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import {
  callbackPriorities,
  callbackServices,
  callbackStaff,
  callbackStatuses,
  mockCallbackRequests,
} from '../data/mockCallbackRequests.js'
import {
  subscribeCallbackRequests,
  saveCallbackRequest as firestoreSaveCallback,
  updateCallbackStatus as firestoreUpdateCallback,
  deleteCallbackRequest as firestoreDeleteCallback,
} from '../services/adminFirestoreService.js'

const pageSizes = [10, 20, 50]
const emptyRequest = {
  customerName: '', phone: '', email: '', service: '', callbackDate: '', callbackTime: '',
  priority: 'Medium', status: 'New', customerMessage: '', adminNotes: '', assignedStaff: 'Suraj Patil',
}
const priorityOrder = { Low: 1, Medium: 2, High: 3, Urgent: 4 }
const priorityTone = { Low: 'slate', Medium: 'blue', High: 'amber', Urgent: 'red' }
const statusTone = { New: 'blue', Pending: 'amber', 'In Progress': 'violet', Contacted: 'cyan', Completed: 'green', 'No Answer': 'red', Cancelled: 'slate' }
const terminalStatuses = ['Completed', 'Cancelled']

function isValidIndianPhone(value) {
  const normalized = value.trim().replace(/[\s()-]/g, '').replace(/^(?:\+91|91|0)/, '')
  return /^[6-9]\d{9}$/.test(normalized)
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function dateInputValue(value = '') {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match ? match[1] : ''
}

function displayDate(value) {
  const normalized = dateInputValue(value)
  if (!normalized || !isValidDate(normalized)) return value || '—'
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

function formatTime(value) {
  if (!value) return '—'
  const [hours, minutes] = value.split(':').map(Number)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return value
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' })
    .format(new Date(2000, 0, 1, hours, minutes))
}

function isOverdue(request, now = Date.now()) {
  if (terminalStatuses.includes(request.status)) return false
  const callbackAt = new Date(`${request.callbackDate}T${request.callbackTime}:00`).getTime()
  return Number.isFinite(callbackAt) && callbackAt < now
}

function saveCsv(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'callback-requests-export.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function createRequestId(requests, sequence) {
  const ids = new Set(requests.map((request) => request.id))
  let next = sequence.current
  while (ids.has(`CBK-2026-${next}`)) next += 1
  sequence.current = next + 1
  return `CBK-2026-${next}`
}

function SummaryCard({ label, value, tone }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong></div>
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${statusTone[status] || 'slate'}`}>{status}</span>
}

function PriorityBadge({ priority }) {
  return <span className={`enquiry-priority-badge enquiry-priority-${priorityTone[priority] || 'slate'}`}>{priority}</span>
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  return <button type="button" className={`callback-sort-button ${sortBy === sortKey ? 'callback-sort-active' : ''}`} onClick={() => onClick(sortKey)} aria-label={`Sort by ${children}, ${sortBy === sortKey && direction === 'asc' ? 'descending' : 'ascending'}`}>
    {children}<ArrowUpDown size={11} />
  </button>
}

function FormField({ label, name, value, onChange, error, type = 'text', required = false, options, placeholder, wide = false }) {
  const errorId = `callback-error-${name}`
  return <label className={`callback-form-field${wide ? ' callback-form-wide' : ''}`}>
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    {options
      ? <select name={name} value={value} onChange={onChange} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
        <option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}
      </select>
      : type === 'textarea'
        ? <textarea name={name} value={value} onChange={onChange} rows={3} placeholder={placeholder} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        : <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />}
    {error && <small id={errorId} className="field-error">{error}</small>}
  </label>
}

function DetailItem({ label, children }) {
  return <div className="callback-detail-item"><small>{label}</small><strong>{children || '—'}</strong></div>
}

export default function CallbackRequests() {
  const [requests, setRequests] = useState(mockCallbackRequests)

  // Subscribe to real-time Firestore callback requests
  useEffect(() => {
    const unsubscribe = subscribeCallbackRequests((firestoreReqs) => {
      if (firestoreReqs && firestoreReqs.length > 0) {
        setRequests(firestoreReqs)
      }
    })
    return () => unsubscribe()
  }, [])
  const requestIdSequence = useRef(mockCallbackRequests.reduce((value, request) => {
    const match = /^CBK-2026-(\d+)$/.exec(request.id)
    return match ? Math.max(value, Number(match[1])) : value
  }, 2000) + 1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [callbackDateFilter, setCallbackDateFilter] = useState('')
  const [createdFrom, setCreatedFrom] = useState('')
  const [createdTo, setCreatedTo] = useState('')
  const [sortBy, setSortBy] = useState('callbackDate')
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyRequest)
  const [errors, setErrors] = useState({})
  const [selectedId, setSelectedId] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [toast, setToast] = useState('')
  const selectedRequest = requests.find((request) => request.id === selectedId)

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const phoneQuery = query.replace(/\D/g, '')
    return requests.filter((request) => {
      const searchable = [request.id, request.customerName, request.phone, request.service, request.customerMessage, request.adminNotes]
      const matchesSearch = !query || searchable.some((value) => String(value || '').toLocaleLowerCase().includes(query))
        || (phoneQuery.length > 0 && request.phone.replace(/\D/g, '').includes(phoneQuery))
      const createdDate = dateInputValue(request.createdDate)
      return matchesSearch
        && (statusFilter === 'All statuses' || request.status === statusFilter)
        && (priorityFilter === 'All priorities' || request.priority === priorityFilter)
        && (!callbackDateFilter || request.callbackDate === callbackDateFilter)
        && (!createdFrom || createdDate >= createdFrom)
        && (!createdTo || createdDate <= createdTo)
    }).sort((first, second) => {
      let comparison
      if (sortBy === 'priority') comparison = priorityOrder[first.priority] - priorityOrder[second.priority]
      else if (sortBy === 'callbackDate') {
        comparison = `${first.callbackDate}T${first.callbackTime}`.localeCompare(`${second.callbackDate}T${second.callbackTime}`)
      } else if (sortBy === 'createdDate') comparison = first.createdDate.localeCompare(second.createdDate)
      else comparison = String(first[sortBy] || '').localeCompare(String(second[sortBy] || ''), 'en', { sensitivity: 'base', numeric: true })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [callbackDateFilter, createdFrom, createdTo, priorityFilter, requests, search, sortBy, sortDirection, statusFilter])

  const summary = useMemo(() => ({
    total: requests.length,
    newCount: requests.filter((request) => request.status === 'New').length,
    pending: requests.filter((request) => ['Pending', 'In Progress', 'No Answer'].includes(request.status)).length,
    completed: requests.filter((request) => request.status === 'Completed').length,
    overdue: requests.filter((request) => isOverdue(request)).length,
  }), [requests])
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    if (!(formOpen || selectedId || deleteConfirmation)) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setFormOpen(false)
        setSelectedId('')
        setDeleteConfirmation(null)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [deleteConfirmation, formOpen, selectedId])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All statuses')
    setPriorityFilter('All priorities')
    setCallbackDateFilter('')
    setCreatedFrom('')
    setCreatedTo('')
    setPage(1)
  }

  const openAddForm = () => {
    setSelectedId('')
    setEditingId('')
    setForm({ ...emptyRequest })
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (request) => {
    setSelectedId('')
    setEditingId(request.id)
    setForm({ ...request })
    setErrors({})
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyRequest })
    setErrors({})
  }

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submitForm = (event) => {
    event.preventDefault()
    const validation = {}
    if (!form.customerName.trim()) validation.customerName = 'Enter the customer name.'
    if (!form.phone.trim()) validation.phone = 'Enter the customer phone number.'
    else if (!isValidIndianPhone(form.phone)) validation.phone = 'Enter a valid Indian mobile number (10 digits, starting 6–9).'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) validation.email = 'Enter a valid email address.'
    if (!form.service) validation.service = 'Select a related service or trip type.'
    if (!isValidDate(form.callbackDate)) validation.callbackDate = 'Enter a valid preferred callback date.'
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(form.callbackTime)) validation.callbackTime = 'Select a valid preferred callback time.'
    if (!form.customerMessage.trim()) validation.customerMessage = 'Enter the reason for the callback.'
    setErrors(validation)
    if (Object.keys(validation).length) return

    const timestamp = new Date().toISOString().slice(0, 19)
    const saved = {
      ...form,
      id: editingId || createRequestId(requests, requestIdSequence),
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      customerMessage: form.customerMessage.trim(),
      adminNotes: form.adminNotes.trim(),
      assignedStaff: form.assignedStaff.trim(),
      createdDate: editingId ? requests.find((request) => request.id === editingId).createdDate : timestamp,
      lastUpdatedDate: timestamp,
      history: editingId
        ? [...(requests.find((request) => request.id === editingId).history || []), { date: timestamp, action: 'Request details updated.' }]
        : [{ date: timestamp, action: 'Callback request created.' }],
    }
    setRequests((current) => editingId
      ? current.map((request) => request.id === editingId ? saved : request)
      : [saved, ...current])
    firestoreSaveCallback(saved).catch((err) => console.warn('Firestore callback save error:', err))
    closeForm()
    setPage(1)
    notify(editingId ? 'Callback request updated.' : `${saved.id} added successfully.`)
  }

  const updateRequest = (id, changes, message) => {
    const timestamp = new Date().toISOString().slice(0, 19)
    setRequests((current) => current.map((request) => request.id === id
      ? {
          ...request,
          ...changes,
          lastUpdatedDate: timestamp,
          history: [...(request.history || []), { date: timestamp, action: message }],
        }
      : request))
    firestoreUpdateCallback(id, changes.status, changes.adminNotes || '', changes.assignedStaff || '').catch((err) =>
      console.warn('Firestore callback update error:', err)
    )
    notify(message)
  }

  const deleteRequest = () => {
    if (!deleteConfirmation) return
    const deletedName = deleteConfirmation.customerName
    setRequests((current) => current.filter((request) => request.id !== deleteConfirmation.id))
    firestoreDeleteCallback(deleteConfirmation.id).catch((err) => console.warn('Firestore callback delete error:', err))
    setPage((current) => Math.max(1, Math.min(current, Math.ceil(Math.max(0, filteredRequests.length - 1) / pageSize))))
    setDeleteConfirmation(null)
    notify(`Callback request from ${deletedName} deleted.`)
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
      'Request ID', 'Customer name', 'Phone', 'Email', 'Preferred callback date',
      'Preferred callback time', 'Related service or trip type', 'Priority', 'Status',
      'Customer message', 'Internal admin notes', 'Assigned staff', 'Created date', 'Last updated date',
    ]
    const rows = filteredRequests.map((request) => [
      request.id, request.customerName, request.phone, request.email, request.callbackDate,
      request.callbackTime, request.service, request.priority, request.status, request.customerMessage,
      request.adminNotes, request.assignedStaff, request.createdDate, request.lastUpdatedDate,
    ])
    saveCsv([headers, ...rows])
  }

  const sortOptions = [
    ['id', 'Request ID'], ['customerName', 'Customer name'], ['callbackDate', 'Preferred callback date/time'],
    ['service', 'Service / trip type'], ['priority', 'Priority'], ['status', 'Status'], ['createdDate', 'Created date'],
  ]

  return <>
    <PageHeader title="Callback Requests" description="Review callback requests, prioritize follow-ups and track contact outcomes.">
      <div className="callback-page-actions">
        <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
        <button type="button" className="primary-button" onClick={openAddForm}><Plus size={14} />Add Callback Request</button>
      </div>
    </PageHeader>
    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Demo callback data</strong> — all sample customer names, contacts and requests are illustrative.</span></div>
    <section className="callback-summary-grid" aria-label="Callback request summary">
      <SummaryCard label="Total Requests" value={summary.total} tone="blue" />
      <SummaryCard label="New Requests" value={summary.newCount} tone="violet" />
      <SummaryCard label="Pending Callbacks" value={summary.pending} tone="amber" />
      <SummaryCard label="Completed Callbacks" value={summary.completed} tone="green" />
      <SummaryCard label="Overdue Callbacks" value={summary.overdue} tone="slate" />
    </section>
    {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

    <section className="panel callback-management-panel">
      <div className="panel-heading callback-panel-heading">
        <div><h2>Callback queue</h2><p>Search, filter, schedule and manage customer follow-ups.</p></div>
        <span className="vehicle-result-count">{filteredRequests.length} matching requests</span>
      </div>
      <div className="callback-filters">
        <label className="search-field callback-search"><Search size={15} /><input type="search" aria-label="Search callback requests" placeholder="Search ID, customer, phone, service or notes..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
        <label className="filter-select"><select aria-label="Filter callback requests by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}>{['All statuses', ...callbackStatuses].map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="filter-select"><select aria-label="Filter callback requests by priority" value={priorityFilter} onChange={(event) => { setPriorityFilter(event.target.value); setPage(1) }}>{['All priorities', ...callbackPriorities].map((priority) => <option key={priority}>{priority}</option>)}</select></label>
        <label className="filter-select callback-date-filter"><span>Callback</span><input aria-label="Filter by preferred callback date" type="date" value={callbackDateFilter} onChange={(event) => { setCallbackDateFilter(event.target.value); setPage(1) }} /></label>
        <label className="filter-select callback-date-filter"><span>Created from</span><input aria-label="Filter created from date" type="date" max={createdTo || undefined} value={createdFrom} onChange={(event) => { setCreatedFrom(event.target.value); setPage(1) }} /></label>
        <label className="filter-select callback-date-filter"><span>Created to</span><input aria-label="Filter created to date" type="date" min={createdFrom || undefined} value={createdTo} onChange={(event) => { setCreatedTo(event.target.value); setPage(1) }} /></label>
        <label className="filter-select"><select aria-label="Sort callback requests by" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setSortDirection('asc'); setPage(1) }}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="button" className="secondary-button callback-sort-direction" aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`} onClick={() => { setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
        <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear All Filters</button>
      </div>

      <div className="table-scroll callback-table-scroll">
        <table className="data-table callback-table">
          <thead><tr>
            <th><SortButton sortKey="id" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Request ID</SortButton></th>
            <th><SortButton sortKey="customerName" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Customer</SortButton></th>
            <th><SortButton sortKey="callbackDate" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Preferred callback</SortButton></th>
            <th><SortButton sortKey="service" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Service / trip</SortButton></th>
            <th><SortButton sortKey="priority" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Priority</SortButton></th>
            <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Status</SortButton></th>
            <th><SortButton sortKey="createdDate" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Created</SortButton></th>
            <th>Actions</th>
          </tr></thead>
          <tbody>{pageRequests.length ? pageRequests.map((request) => <tr key={request.id} className={isOverdue(request) ? 'callback-row-overdue' : ''}>
            <td className="callback-id-cell">{request.id}{isOverdue(request) && <small className="callback-overdue-label">Overdue</small>}</td>
            <td><div className="callback-customer-cell"><strong>{request.customerName}</strong><small>{request.phone}</small></div></td>
            <td><div className="callback-date-cell"><strong>{displayDate(request.callbackDate)}</strong><small>{formatTime(request.callbackTime)}</small></div></td>
            <td>{request.service}</td>
            <td><select className="callback-inline-select" aria-label={`Priority for ${request.id}`} value={request.priority} onChange={(event) => updateRequest(request.id, { priority: event.target.value }, `${request.id} priority changed to ${event.target.value}.`)}>{callbackPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select></td>
            <td><select className="callback-inline-select callback-status-select" aria-label={`Status for ${request.id}`} value={request.status} onChange={(event) => updateRequest(request.id, { status: event.target.value }, `${request.id} status changed to ${event.target.value}.`)}>{callbackStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
            <td>{displayDate(request.createdDate)}</td>
            <td className="callback-actions-cell">
              <button className="table-action-button" type="button" aria-label={`View ${request.id}`} onClick={() => setSelectedId(request.id)}><Eye size={15} /></button>
              <button className="table-action-button" type="button" aria-label={`Edit ${request.id}`} onClick={() => openEditForm(request)}><Edit3 size={15} /></button>
              <button className="table-action-button danger-button" type="button" aria-label={`Delete ${request.id}`} onClick={() => setDeleteConfirmation(request)}><Trash2 size={15} /></button>
            </td>
          </tr>) : <tr><td colSpan="8"><div className="empty-state callback-empty-state"><Search size={20} /><strong>No callback requests found</strong><span>Adjust your search or filters, or clear all filters to see the full callback queue.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>}</tbody>
        </table>
      </div>
      <div className="pagination-row callback-pagination">
        <span className="pagination-count">Showing {filteredRequests.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length}</span>
        <label className="page-size-control">Rows per page<select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <button type="button" className="secondary-button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" className="secondary-button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
      </div>
    </section>

    {selectedRequest && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedId('')}>
      <section className="callback-details-modal" role="dialog" aria-modal="true" aria-labelledby="callback-details-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">CALLBACK REQUEST DETAILS</span><h2 id="callback-details-title">{selectedRequest.id}</h2><p className="callback-detail-subtitle">{selectedRequest.service}</p></div><button className="icon-button" type="button" aria-label="Close callback details" onClick={() => setSelectedId('')}><X size={18} /></button></div>
        <div className="callback-detail-status"><StatusBadge status={selectedRequest.status} /><PriorityBadge priority={selectedRequest.priority} />{isOverdue(selectedRequest) && <span className="callback-overdue-label">Overdue</span>}</div>
        <section className="callback-detail-section"><h3>Customer contact</h3><div className="callback-detail-grid">
          <DetailItem label="Customer name">{selectedRequest.customerName}</DetailItem>
          <div className="callback-detail-item"><small>Phone number</small><div className="callback-contact-line"><strong>{selectedRequest.phone}</strong><button className="callback-copy-button" type="button" aria-label="Copy phone number" onClick={() => copyValue('Phone number', selectedRequest.phone)}><Copy size={13} />Copy</button></div></div>
          <div className="callback-detail-item"><small>Email address</small><div className="callback-contact-line"><strong>{selectedRequest.email || '—'}</strong>{selectedRequest.email && <button className="callback-copy-button" type="button" aria-label="Copy email address" onClick={() => copyValue('Email address', selectedRequest.email)}><Copy size={13} />Copy</button>}</div></div>
        </div></section>
        <section className="callback-detail-section"><h3>Callback preference</h3><div className="callback-detail-grid">
          <DetailItem label="Preferred date">{displayDate(selectedRequest.callbackDate)}</DetailItem>
          <DetailItem label="Preferred time">{formatTime(selectedRequest.callbackTime)}</DetailItem>
          <DetailItem label="Related service">{selectedRequest.service}</DetailItem>
          <DetailItem label="Assigned staff">{selectedRequest.assignedStaff}</DetailItem>
          <DetailItem label="Customer message">{selectedRequest.customerMessage}</DetailItem>
        </div></section>
        <section className="callback-detail-section"><h3>Manage status and priority</h3><div className="callback-detail-controls">
          <label>Status<select aria-label="Details status" value={selectedRequest.status} onChange={(event) => updateRequest(selectedRequest.id, { status: event.target.value }, `${selectedRequest.id} status changed to ${event.target.value}.`)}>{callbackStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Priority<select aria-label="Details priority" value={selectedRequest.priority} onChange={(event) => updateRequest(selectedRequest.id, { priority: event.target.value }, `${selectedRequest.id} priority changed to ${event.target.value}.`)}>{callbackPriorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
        </div></section>
        <section className="callback-detail-section"><h3>Admin notes and activity</h3><div className="callback-internal-notes"><small>Internal notes</small><p>{selectedRequest.adminNotes || 'No internal notes.'}</p></div><div className="callback-history">{(selectedRequest.history || []).slice().reverse().map((entry, index) => <div key={`${entry.date}-${index}`}><span className="callback-history-dot" /><p><strong>{entry.action}</strong><small>{displayDateTime(entry.date)}</small></p></div>)}</div></section>
        <section className="callback-detail-dates"><DetailItem label="Created">{displayDateTime(selectedRequest.createdDate)}</DetailItem><DetailItem label="Last updated">{displayDateTime(selectedRequest.lastUpdatedDate)}</DetailItem></section>
        <div className="callback-modal-actions"><button type="button" className="secondary-button" onClick={() => openEditForm(selectedRequest)}>Edit request</button><button type="button" className="primary-button" onClick={() => setSelectedId('')}>Done</button></div>
      </section>
    </div>}

    {formOpen && <div className="modal-backdrop" role="presentation" onClick={closeForm}>
      <section className="callback-form-modal" role="dialog" aria-modal="true" aria-labelledby="callback-form-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">{editingId ? 'UPDATE REQUEST' : 'NEW CALLBACK'}</span><h2 id="callback-form-title">{editingId ? `Edit ${editingId}` : 'Add Callback Request'}</h2><p className="callback-detail-subtitle">Set the preferred contact time and keep notes for the team.</p></div><button className="icon-button" type="button" aria-label="Close callback form" onClick={closeForm}><X size={18} /></button></div>
        <form className="callback-form" onSubmit={submitForm} noValidate>
          <fieldset className="callback-form-section"><legend>Customer and callback</legend><div className="callback-form-grid">
            <FormField label="Customer name" name="customerName" value={form.customerName} onChange={updateForm} error={errors.customerName} required />
            <FormField label="Phone number" name="phone" value={form.phone} onChange={updateForm} error={errors.phone} placeholder="+91 98765 43210" required />
            <FormField label="Email (optional)" name="email" type="email" value={form.email} onChange={updateForm} error={errors.email} />
            <FormField label="Related service / trip type" name="service" value={form.service} onChange={updateForm} error={errors.service} options={callbackServices} required />
            <FormField label="Preferred callback date" name="callbackDate" type="date" value={form.callbackDate} onChange={updateForm} error={errors.callbackDate} required />
            <FormField label="Preferred callback time" name="callbackTime" type="time" value={form.callbackTime} onChange={updateForm} error={errors.callbackTime} required />
            <FormField label="Priority" name="priority" value={form.priority} onChange={updateForm} options={callbackPriorities} required />
            <FormField label="Status" name="status" value={form.status} onChange={updateForm} options={callbackStatuses} required />
            <FormField label="Customer message / reason" name="customerMessage" type="textarea" value={form.customerMessage} onChange={updateForm} error={errors.customerMessage} required wide />
          </div></fieldset>
          <fieldset className="callback-form-section"><legend>Internal follow-up</legend><div className="callback-form-grid">
            <FormField label="Assigned staff member" name="assignedStaff" value={form.assignedStaff} onChange={updateForm} options={callbackStaff} />
            <FormField label="Internal admin notes" name="adminNotes" type="textarea" value={form.adminNotes} onChange={updateForm} wide />
          </div></fieldset>
          <div className="callback-modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add request'}</button></div>
        </form>
      </section>
    </div>}

    {deleteConfirmation && <div className="modal-backdrop" role="presentation" onClick={() => setDeleteConfirmation(null)}>
      <section className="callback-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="callback-delete-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">DELETE CALLBACK</span><h2 id="callback-delete-title">Delete this request?</h2></div><button className="icon-button" type="button" aria-label="Close delete confirmation" onClick={() => setDeleteConfirmation(null)}><X size={18} /></button></div>
        <p>This will remove the callback request from local demo data. The action cannot be undone.</p>
        <div className="callback-modal-actions"><button type="button" className="secondary-button" onClick={() => setDeleteConfirmation(null)}>Cancel</button><button type="button" className="primary-button callback-delete-confirm" onClick={deleteRequest}>Delete request</button></div>
      </section>
    </div>}
  </>
}
