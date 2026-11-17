import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, Download, Edit3, Eye, Plus, Search, Star, Trash2, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import { mockReviews, reviewServices, reviewStatuses } from '../data/mockReviews.js'
import {
  subscribeReviews,
  saveReview as firestoreSaveReview,
  updateReviewStatus as firestoreUpdateReviewStatus,
  deleteReview as firestoreDeleteReview,
} from '../services/adminFirestoreService.js'

const pageSizes = [10, 20, 50]
const emptyReview = {
  customerName: '', email: '', rating: '5', title: '', text: '', service: '',
  reviewDate: '', status: 'Pending', featured: false, adminResponse: '',
}
const statusTone = { Pending: 'amber', Published: 'green', Hidden: 'slate', Rejected: 'red' }

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function displayDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  if (!isValidDate(value)) return value
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

function saveCsv(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'reviews-export.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function createReviewId(reviews, sequence) {
  const ids = new Set(reviews.map((review) => review.id))
  let next = sequence.current
  while (ids.has(`REV-2026-${next}`)) next += 1
  sequence.current = next + 1
  return `REV-2026-${next}`
}

function SummaryCard({ label, value, tone, supporting }) {
  return <div className={`summary-card summary-card-${tone}`}><span className="summary-card-label">{label}</span><strong>{value}</strong>{supporting && <small>{supporting}</small>}</div>
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${statusTone[status] || 'slate'}`}>{status}</span>
}

function Stars({ rating, label, size = 14 }) {
  return <span className="review-stars" role="img" aria-label={label || `${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={size} fill={star <= rating ? 'currentColor' : 'none'} aria-hidden="true" />)}
    <span className="review-rating-number">{rating}</span>
  </span>
}

function SortButton({ sortKey, sortBy, direction, onClick, children }) {
  return <button type="button" className={`review-sort-button ${sortBy === sortKey ? 'review-sort-active' : ''}`} onClick={() => onClick(sortKey)} aria-label={`Sort by ${children}, ${sortBy === sortKey && direction === 'asc' ? 'descending' : 'ascending'}`}>
    {children}<ArrowUpDown size={11} />
  </button>
}

function FormField({ label, name, value, onChange, error, type = 'text', required = false, options, wide = false, min, max, placeholder, rows = 3 }) {
  const errorId = `review-error-${name}`
  return <label className={`review-form-field${wide ? ' review-form-wide' : ''}`}>
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    {options
      ? <select name={name} value={value} onChange={onChange} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
        <option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}
      </select>
      : type === 'textarea'
        ? <textarea name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        : <input name={name} type={type} value={value} onChange={onChange} required={required} min={min} max={max} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />}
    {error && <small id={errorId} className="field-error">{error}</small>}
  </label>
}

function DetailItem({ label, children }) {
  return <div className="review-detail-item"><small>{label}</small><strong>{children || '—'}</strong></div>
}

export default function Reviews() {
  const [reviews, setReviews] = useState(mockReviews)

  // Subscribe to real-time Firestore reviews
  useEffect(() => {
    const unsubscribe = subscribeReviews((firestoreReviews) => {
      if (firestoreReviews && firestoreReviews.length > 0) {
        setReviews(firestoreReviews)
      }
    })
    return () => unsubscribe()
  }, [])
  const reviewIdSequence = useRef(mockReviews.reduce((highest, review) => {
    const match = /^REV-2026-(\d+)$/.exec(review.id)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 3000) + 1)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('All ratings')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [featuredFilter, setFeaturedFilter] = useState('All reviews')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('reviewDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(emptyReview)
  const [errors, setErrors] = useState({})
  const [selectedId, setSelectedId] = useState('')
  const [pendingModeration, setPendingModeration] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(null)
  const [toast, setToast] = useState('')

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return reviews.filter((review) => {
      const searchable = [review.id, review.customerName, review.title, review.text, review.service]
      return (!query || searchable.some((value) => String(value || '').toLocaleLowerCase().includes(query)))
        && (ratingFilter === 'All ratings' || review.rating === Number(ratingFilter))
        && (statusFilter === 'All statuses' || review.status === statusFilter)
        && (featuredFilter === 'All reviews' || review.featured === (featuredFilter === 'Featured'))
        && (!dateFrom || review.reviewDate >= dateFrom)
        && (!dateTo || review.reviewDate <= dateTo)
    }).sort((first, second) => {
      let comparison
      if (sortBy === 'rating') comparison = first.rating - second.rating
      else if (sortBy === 'reviewDate') comparison = first.reviewDate.localeCompare(second.reviewDate)
      else comparison = String(first[sortBy] || '').localeCompare(String(second[sortBy] || ''), 'en', { sensitivity: 'base', numeric: true })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [dateFrom, dateTo, featuredFilter, ratingFilter, reviews, search, sortBy, sortDirection, statusFilter])

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0
  const summary = {
    total: reviews.length,
    average: averageRating.toFixed(1),
    fiveStar: reviews.filter((review) => review.rating === 5).length,
    pending: reviews.filter((review) => review.status === 'Pending').length,
    published: reviews.filter((review) => review.status === 'Published').length,
  }
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selectedReview = reviews.find((review) => review.id === selectedId)

  useEffect(() => {
    if (!(formOpen || selectedId || pendingModeration || deleteConfirmation)) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setFormOpen(false)
        setSelectedId('')
        setPendingModeration(null)
        setDeleteConfirmation(null)
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [deleteConfirmation, formOpen, pendingModeration, selectedId])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const clearFilters = () => {
    setSearch('')
    setRatingFilter('All ratings')
    setStatusFilter('All statuses')
    setFeaturedFilter('All reviews')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const openAddForm = () => {
    setSelectedId('')
    setEditingId('')
    setForm({ ...emptyReview })
    setErrors({})
    setFormOpen(true)
  }

  const openEditForm = (review) => {
    setSelectedId('')
    setEditingId(review.id)
    setForm({ ...review, rating: String(review.rating) })
    setErrors({})
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId('')
    setForm({ ...emptyReview })
    setErrors({})
  }

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const submitForm = (event) => {
    event.preventDefault()
    const validation = {}
    if (!form.customerName.trim()) validation.customerName = 'Enter the customer name.'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) validation.email = 'Enter a valid email address.'
    if (!/^[1-5]$/.test(String(form.rating))) validation.rating = 'Rating must be a whole number from 1 to 5.'
    if (!form.title.trim()) validation.title = 'Enter a review title.'
    if (!form.text.trim()) validation.text = 'Enter the review text.'
    if (!form.service) validation.service = 'Select a related service or trip type.'
    if (!isValidDate(form.reviewDate)) validation.reviewDate = 'Enter a valid review date.'
    setErrors(validation)
    if (Object.keys(validation).length) return

    const timestamp = new Date().toISOString().slice(0, 19)
    const existing = editingId ? reviews.find((review) => review.id === editingId) : null
    const savedReview = {
      ...form,
      id: editingId || createReviewId(reviews, reviewIdSequence),
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      rating: Number(form.rating),
      title: form.title.trim(),
      text: form.text.trim(),
      adminResponse: form.adminResponse.trim(),
      createdDate: existing ? existing.createdDate : timestamp,
      updatedDate: timestamp,
    }
    setReviews((current) => editingId
      ? current.map((review) => review.id === editingId ? savedReview : review)
      : [savedReview, ...current])
    firestoreSaveReview(savedReview).catch((err) => console.warn('Firestore review save error:', err))
    closeForm()
    setPage(1)
    notify(editingId ? 'Review updated successfully.' : `${savedReview.id} added successfully.`)
  }

  const updateReview = (id, changes, message) => {
    const timestamp = new Date().toISOString().slice(0, 19)
    setReviews((current) => current.map((review) => review.id === id
      ? { ...review, ...changes, updatedDate: timestamp }
      : review))
    if (changes.status) {
      firestoreUpdateReviewStatus(id, changes.status).catch((err) =>
        console.warn('Firestore review status error:', err)
      )
    }
    notify(message)
  }

  const changeModeration = (review, status) => {
    if (status === 'Rejected') {
      setPendingModeration({ review, status })
      return
    }
    updateReview(review.id, { status }, `${review.id} marked ${status.toLowerCase()}.`)
  }

  const confirmReject = () => {
    if (!pendingModeration) return
    updateReview(pendingModeration.review.id, { status: 'Rejected' }, `${pendingModeration.review.id} rejected.`)
    setPendingModeration(null)
  }

  const deleteReview = () => {
    if (!deleteConfirmation) return
    setReviews((current) => current.filter((review) => review.id !== deleteConfirmation.id))
    firestoreDeleteReview(deleteConfirmation.id).catch((err) => console.warn('Firestore review delete error:', err))
    setPage((current) => Math.max(1, Math.min(current, Math.ceil(Math.max(0, filteredReviews.length - 1) / pageSize))))
    setDeleteConfirmation(null)
    notify(`${deleteConfirmation.id} deleted.`)
  }

  const changeSort = (key) => {
    setSortDirection((direction) => sortBy === key && direction === 'asc' ? 'desc' : 'asc')
    setSortBy(key)
    setPage(1)
  }

  const exportCsv = () => {
    const headers = [
      'Review ID', 'Customer name', 'Customer email', 'Rating', 'Title', 'Review text',
      'Related service', 'Review date', 'Moderation status', 'Featured', 'Admin response',
      'Created date', 'Last updated date',
    ]
    const rows = filteredReviews.map((review) => [
      review.id, review.customerName, review.email, review.rating, review.title, review.text,
      review.service, review.reviewDate, review.status, review.featured ? 'Yes' : 'No',
      review.adminResponse, review.createdDate, review.updatedDate,
    ])
    saveCsv([headers, ...rows])
  }

  const sortOptions = [
    ['id', 'Review ID'], ['customerName', 'Customer name'], ['rating', 'Rating'],
    ['title', 'Review title'], ['service', 'Service'], ['reviewDate', 'Review date'],
    ['status', 'Moderation status'],
  ]

  return <>
    <PageHeader title="Reviews Management" description="Review customer feedback, manage moderation and feature selected reviews.">
      <div className="reviews-page-actions">
        <button type="button" className="secondary-button" onClick={exportCsv}><Download size={14} />Export CSV</button>
        <button type="button" className="primary-button" onClick={openAddForm}><Plus size={14} />Add Review</button>
      </div>
    </PageHeader>
    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Fictional demo reviews</strong> — these admin-entered examples are illustrative, not verified customer testimonials.</span></div>
    <section className="reviews-summary-grid" aria-label="Review summary">
      <SummaryCard label="Total Reviews" value={summary.total} tone="blue" />
      <SummaryCard label="Average Rating" value={summary.average} tone="amber" supporting="out of 5 stars" />
      <SummaryCard label="5-Star Reviews" value={summary.fiveStar} tone="violet" />
      <SummaryCard label="Pending Moderation" value={summary.pending} tone="slate" />
      <SummaryCard label="Published Reviews" value={summary.published} tone="green" />
    </section>
    {toast && <div className="vehicle-toast" role="status"><Check size={16} />{toast}</div>}

    <section className="panel reviews-management-panel">
      <div className="panel-heading reviews-panel-heading">
        <div><h2>Review directory</h2><p>Search feedback, check moderation status and manage featured reviews.</p></div>
        <span className="vehicle-result-count">{filteredReviews.length} matching reviews</span>
      </div>
      <div className="reviews-filters">
        <label className="search-field reviews-search"><Search size={15} /><input type="search" aria-label="Search reviews" placeholder="Search ID, customer, title, review or service..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
        <label className="filter-select"><select aria-label="Filter reviews by rating" value={ratingFilter} onChange={(event) => { setRatingFilter(event.target.value); setPage(1) }}>{['All ratings', '5', '4', '3', '2', '1'].map((rating) => <option key={rating} value={rating}>{rating === 'All ratings' ? rating : `${rating} star${rating === '1' ? '' : 's'}`}</option>)}</select></label>
        <label className="filter-select"><select aria-label="Filter reviews by moderation status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}>{['All statuses', ...reviewStatuses].map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="filter-select"><select aria-label="Filter featured reviews" value={featuredFilter} onChange={(event) => { setFeaturedFilter(event.target.value); setPage(1) }}>{['All reviews', 'Featured', 'Not featured'].map((featured) => <option key={featured}>{featured}</option>)}</select></label>
        <label className="filter-select review-date-filter"><span>From</span><input aria-label="Review date from" type="date" max={dateTo || undefined} value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1) }} /></label>
        <label className="filter-select review-date-filter"><span>To</span><input aria-label="Review date to" type="date" min={dateFrom || undefined} value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1) }} /></label>
        <label className="filter-select"><select aria-label="Sort reviews by" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setSortDirection('asc'); setPage(1) }}>{sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="button" className="secondary-button review-sort-direction" aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`} onClick={() => { setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc'); setPage(1) }}>{sortDirection === 'asc' ? 'Ascending' : 'Descending'}</button>
        <button type="button" className="clear-filters-button" onClick={clearFilters}>Clear All Filters</button>
      </div>
      <div className="table-scroll reviews-table-scroll">
        <table className="data-table reviews-table">
          <thead><tr>
            <th><SortButton sortKey="id" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Review ID</SortButton></th>
            <th><SortButton sortKey="customerName" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Customer</SortButton></th>
            <th><SortButton sortKey="rating" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Rating</SortButton></th>
            <th><SortButton sortKey="title" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Review</SortButton></th>
            <th><SortButton sortKey="service" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Service / trip</SortButton></th>
            <th><SortButton sortKey="reviewDate" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Review date</SortButton></th>
            <th><SortButton sortKey="status" sortBy={sortBy} direction={sortDirection} onClick={changeSort}>Moderation</SortButton></th>
            <th>Featured</th><th>Actions</th>
          </tr></thead>
          <tbody>{pageReviews.length ? pageReviews.map((review) => <tr key={review.id} className={`review-status-row review-row-${review.status.toLowerCase()}`}>
            <td className="review-id-cell">{review.id}</td>
            <td><div className="review-customer-cell"><strong>{review.customerName}</strong><small>{review.email || 'No email provided'}</small></div></td>
            <td><Stars rating={review.rating} /></td>
            <td><div className="review-content-cell"><strong>{review.title}</strong><small>{review.text}</small></div></td>
            <td>{review.service}</td>
            <td>{displayDate(review.reviewDate)}</td>
            <td><select className={`review-status-select review-status-${review.status.toLowerCase()}`} aria-label={`Moderation status for ${review.id}`} value={review.status} onChange={(event) => changeModeration(review, event.target.value)}>{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select></td>
            <td><button type="button" className={`review-feature-button ${review.featured ? 'is-featured' : ''}`} aria-label={`${review.featured ? 'Remove featured from' : 'Feature'} ${review.id}`} aria-pressed={review.featured} onClick={() => updateReview(review.id, { featured: !review.featured }, `${review.id} ${review.featured ? 'removed from' : 'marked as'} featured.`)}><Star size={15} fill={review.featured ? 'currentColor' : 'none'} />{review.featured ? 'Featured' : 'No'}</button></td>
            <td className="review-actions-cell">
              <button className="table-action-button" type="button" aria-label={`View ${review.id}`} onClick={() => setSelectedId(review.id)}><Eye size={15} /></button>
              <button className="table-action-button" type="button" aria-label={`Edit ${review.id}`} onClick={() => openEditForm(review)}><Edit3 size={15} /></button>
              <button className="table-action-button danger-button" type="button" aria-label={`Delete ${review.id}`} onClick={() => setDeleteConfirmation(review)}><Trash2 size={15} /></button>
            </td>
          </tr>) : <tr><td colSpan="9"><div className="empty-state reviews-empty-state"><Search size={20} /><strong>No reviews found</strong><span>Adjust your search or filters, or clear all filters to see the review list.</span><button type="button" className="clear-filters-button" onClick={clearFilters}>Clear filters</button></div></td></tr>}</tbody>
        </table>
      </div>
      <div className="pagination-row reviews-pagination">
        <span className="pagination-count">Showing {filteredReviews.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredReviews.length)} of {filteredReviews.length}</span>
        <label className="page-size-control">Rows per page<select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <button type="button" className="secondary-button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button type="button" className="secondary-button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
      </div>
    </section>

    {selectedReview && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedId('')}>
      <section className="review-details-modal" role="dialog" aria-modal="true" aria-labelledby="review-details-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">REVIEW DETAILS</span><h2 id="review-details-title">{selectedReview.id}</h2><p className="review-detail-subtitle">{selectedReview.title}</p></div><button className="icon-button" type="button" aria-label="Close review details" onClick={() => setSelectedId('')}><X size={18} /></button></div>
        <div className="review-detail-status"><StatusBadge status={selectedReview.status} /><span className={`review-feature-tag${selectedReview.featured ? ' is-featured' : ''}`}>{selectedReview.featured ? 'Featured' : 'Not featured'}</span><Stars rating={selectedReview.rating} label={`Rating: ${selectedReview.rating} out of 5 stars`} size={16} /></div>
        <section className="review-detail-section"><h3>Customer information</h3><div className="review-detail-grid"><DetailItem label="Customer name">{selectedReview.customerName}</DetailItem><DetailItem label="Email">{selectedReview.email}</DetailItem><DetailItem label="Related service">{selectedReview.service}</DetailItem><DetailItem label="Review date">{displayDate(selectedReview.reviewDate)}</DetailItem></div></section>
        <section className="review-detail-section"><h3>Full review</h3><p className="review-full-text">{selectedReview.text}</p></section>
        <section className="review-detail-section"><h3>Moderation</h3><div className="review-detail-actions">
          <label>Status<select aria-label="Review details moderation status" value={selectedReview.status} onChange={(event) => changeModeration(selectedReview, event.target.value)}>{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <button type="button" className={`review-feature-button ${selectedReview.featured ? 'is-featured' : ''}`} aria-pressed={selectedReview.featured} onClick={() => updateReview(selectedReview.id, { featured: !selectedReview.featured }, `${selectedReview.id} ${selectedReview.featured ? 'removed from' : 'marked as'} featured.`)}><Star size={15} fill={selectedReview.featured ? 'currentColor' : 'none'} />{selectedReview.featured ? 'Remove featured' : 'Mark featured'}</button>
        </div></section>
        <section className="review-detail-section"><h3>Admin response</h3><p className="review-response-text">{selectedReview.adminResponse || 'No admin response yet.'}</p></section>
        <div className="review-detail-dates"><DetailItem label="Created">{displayDateTime(selectedReview.createdDate)}</DetailItem><DetailItem label="Last updated">{displayDateTime(selectedReview.updatedDate)}</DetailItem></div>
        <div className="review-modal-actions"><button type="button" className="secondary-button" onClick={() => openEditForm(selectedReview)}>Edit review / response</button><button type="button" className="primary-button" onClick={() => setSelectedId('')}>Done</button></div>
      </section>
    </div>}

    {formOpen && <div className="modal-backdrop" role="presentation" onClick={closeForm}>
      <section className="review-form-modal" role="dialog" aria-modal="true" aria-labelledby="review-form-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">{editingId ? 'UPDATE REVIEW' : 'ADMIN-ENTERED DEMO'}</span><h2 id="review-form-title">{editingId ? `Edit ${editingId}` : 'Add Review'}</h2><p className="review-detail-subtitle">Create or update an illustrative review record.</p></div><button className="icon-button" type="button" aria-label="Close review form" onClick={closeForm}><X size={18} /></button></div>
        <form className="review-form" onSubmit={submitForm} noValidate>
          <fieldset className="review-form-section"><legend>Review information</legend><div className="review-form-grid">
            <FormField label="Customer name" name="customerName" value={form.customerName} onChange={updateForm} error={errors.customerName} required />
            <FormField label="Customer email (optional)" name="email" type="email" value={form.email} onChange={updateForm} error={errors.email} />
            <FormField label="Rating (1–5)" name="rating" type="number" value={form.rating} onChange={updateForm} error={errors.rating} required min="1" max="5" />
            <FormField label="Related service / trip type" name="service" value={form.service} onChange={updateForm} error={errors.service} options={reviewServices} required />
            <FormField label="Review title" name="title" value={form.title} onChange={updateForm} error={errors.title} required wide />
            <FormField label="Review text" name="text" type="textarea" value={form.text} onChange={updateForm} error={errors.text} required wide rows={5} />
            <FormField label="Review date" name="reviewDate" type="date" value={form.reviewDate} onChange={updateForm} error={errors.reviewDate} required />
            <FormField label="Moderation status" name="status" value={form.status} onChange={updateForm} options={reviewStatuses} required />
            <label className="review-feature-control"><input name="featured" type="checkbox" checked={form.featured} onChange={updateForm} />Feature this review</label>
            <FormField label="Admin response (optional)" name="adminResponse" type="textarea" value={form.adminResponse} onChange={updateForm} wide rows={3} />
          </div></fieldset>
          <div className="review-modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancel</button><button type="submit" className="primary-button">{editingId ? 'Save changes' : 'Add review'}</button></div>
        </form>
      </section>
    </div>}

    {pendingModeration && <div className="modal-backdrop" role="presentation" onClick={() => setPendingModeration(null)}>
      <section className="review-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="review-reject-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">MODERATION ACTION</span><h2 id="review-reject-title">Reject this review?</h2></div><button className="icon-button" type="button" aria-label="Close reject confirmation" onClick={() => setPendingModeration(null)}><X size={18} /></button></div>
        <p>Rejecting <strong>{pendingModeration.review.id}</strong> will exclude it from published reviews. You can still find it in the admin list.</p>
        <div className="review-modal-actions"><button type="button" className="secondary-button" onClick={() => setPendingModeration(null)}>Cancel</button><button type="button" className="primary-button review-reject-confirm" onClick={confirmReject}>Confirm rejection</button></div>
      </section>
    </div>}

    {deleteConfirmation && <div className="modal-backdrop" role="presentation" onClick={() => setDeleteConfirmation(null)}>
      <section className="review-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="review-delete-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">DELETE REVIEW</span><h2 id="review-delete-title">Delete this review?</h2></div><button className="icon-button" type="button" aria-label="Close delete confirmation" onClick={() => setDeleteConfirmation(null)}><X size={18} /></button></div>
        <p>This will remove the demo review from local state. The action cannot be undone.</p>
        <div className="review-modal-actions"><button type="button" className="secondary-button" onClick={() => setDeleteConfirmation(null)}>Cancel</button><button type="button" className="primary-button review-reject-confirm" onClick={deleteReview}>Delete review</button></div>
      </section>
    </div>}
  </>
}
