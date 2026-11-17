import React from 'react'

const statusMap = {
  // Canonical uppercase statuses
  PENDING: { label: 'Pending', className: 'status-amber' },
  UNDER_REVIEW: { label: 'Under Review', className: 'status-slate' },
  QUOTED: { label: 'Quoted', className: 'status-cyan' },
  CONFIRMED: { label: 'Confirmed', className: 'status-blue' },
  DRIVER_ASSIGNED: { label: 'Driver Assigned', className: 'status-violet' },
  COMPLETED: { label: 'Completed', className: 'status-green' },
  CANCELLED: { label: 'Cancelled', className: 'status-red' },
  REJECTED: { label: 'Rejected', className: 'status-red' },

  // Mixed-case aliases
  Pending: { label: 'Pending', className: 'status-amber' },
  'Under Review': { label: 'Under Review', className: 'status-slate' },
  Quoted: { label: 'Quoted', className: 'status-cyan' },
  Confirmed: { label: 'Confirmed', className: 'status-blue' },
  'Driver Assigned': { label: 'Driver Assigned', className: 'status-violet' },
  Completed: { label: 'Completed', className: 'status-green' },
  Cancelled: { label: 'Cancelled', className: 'status-red' },
  Rejected: { label: 'Rejected', className: 'status-red' },

  // Operational fleet and driver statuses
  Available: { label: 'Available', className: 'status-green' },
  'On Trip': { label: 'On Trip', className: 'status-blue' },
  'On Leave': { label: 'On Leave', className: 'status-amber' },
  Maintenance: { label: 'Maintenance', className: 'status-amber' },
  Inactive: { label: 'Inactive', className: 'status-slate' },
  Active: { label: 'Active', className: 'status-green' },
  New: { label: 'New', className: 'status-amber' },
  Contacted: { label: 'Contacted', className: 'status-green' },
  'In Progress': { label: 'In Progress', className: 'status-blue' },
  Responded: { label: 'Responded', className: 'status-green' },
  Closed: { label: 'Closed', className: 'status-slate' },
  Verified: { label: 'Verified', className: 'status-green' },
  Approved: { label: 'Approved', className: 'status-green' },
  Paid: { label: 'Paid', className: 'status-green' },
  'Partial Advance': { label: 'Advance Paid', className: 'status-blue' },
}

export default function StatusBadge({ status }) {
  if (!status) return <span className="status-badge status-slate">—</span>
  const config = statusMap[status] || {
    label: status.replace(/_/g, ' '),
    className: 'status-slate',
  }
  return <span className={`status-badge ${config.className}`}>{config.label}</span>
}
