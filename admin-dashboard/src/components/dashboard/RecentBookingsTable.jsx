import { useState } from 'react'
import { ArrowUpRight, Ellipsis, Eye, X, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge.jsx'
import { recentBookings } from '../../mock/dashboard.js'

export default function RecentBookingsTable({ searchValue = '', data }) {
  const [menuId, setMenuId] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const sourceData = data && data.length > 0 ? data : recentBookings
  const bookings = sourceData.filter((booking) => {
    const cust = booking.customerName || booking.customer || ''
    const phone = booking.customerPhone || booking.phone || ''
    const pick = booking.pickupLocation || booking.pickup || ''
    const drop = booking.dropLocation || booking.destination || ''
    const st = booking.status || ''
    return `${booking.id} ${cust} ${phone} ${pick} ${drop} ${st}`
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  })

  return (
    <section className="panel bookings-panel">
      <div className="panel-heading">
        <div>
          <h2>Recent Bookings & Outstation Trips</h2>
          <p>Real-time look at latest customer trip requests</p>
        </div>
        <Link className="text-link" to="/bookings">
          View all bookings <ArrowUpRight size={15} />
        </Link>
      </div>

      {bookings.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>BOOKING ID</th>
                <th>CUSTOMER</th>
                <th>PICKUP</th>
                <th>DESTINATION</th>
                <th>TRAVEL DATE</th>
                <th>CAB CATEGORY</th>
                <th>EST. FARE</th>
                <th>STATUS</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const customer = booking.customerName || booking.customer
                const phone = booking.customerPhone || booking.phone
                const pickup = booking.pickupLocation || booking.pickup
                const destination = booking.dropLocation || booking.destination
                const date = booking.pickupDate || booking.date
                const cab = booking.vehicleCategory || booking.cab
                const fare = booking.estimatedFare || booking.fare

                return (
                  <tr key={booking.id}>
                    <td className="booking-id" style={{ fontWeight: 700 }}>{booking.id}</td>
                    <td>
                      <div className="customer-cell">
                        <strong>{customer}</strong>
                        <small>{phone}</small>
                      </div>
                    </td>
                    <td>{pickup}</td>
                    <td>{destination}</td>
                    <td>{date}</td>
                    <td>{cab}</td>
                    <td className="fare-cell">₹{Number(fare).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td className="table-action-cell">
                      <button
                        className="table-action-button"
                        type="button"
                        aria-label={`Actions for ${booking.id}`}
                        aria-expanded={menuId === booking.id}
                        onClick={() => setMenuId((current) => current === booking.id ? '' : booking.id)}
                      >
                        <Ellipsis size={18} />
                      </button>
                      {menuId === booking.id && (
                        <div className="row-action-menu">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setMenuId('')
                            }}
                          >
                            <Eye size={15} /> View details
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <SearchIcon /> No bookings match “{searchValue}”.
        </div>
      )}

      {selectedBooking && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedBooking(null)}>
          <section
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">BOOKING DETAILS</span>
                <h2 id="booking-modal-title">{selectedBooking.id}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-status" style={{ margin: '12px 0 16px' }}>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div className="booking-detail-grid">
              <div>
                <small>Customer Name</small>
                <strong>{selectedBooking.customerName || selectedBooking.customer}</strong>
              </div>
              <div>
                <small>Contact Phone</small>
                <strong>{selectedBooking.customerPhone || selectedBooking.phone}</strong>
              </div>
              <div>
                <small>Pickup Location</small>
                <strong>{selectedBooking.pickupLocation || selectedBooking.pickup}</strong>
              </div>
              <div>
                <small>Drop Destination</small>
                <strong>{selectedBooking.dropLocation || selectedBooking.destination}</strong>
              </div>
              <div>
                <small>Travel Date & Time</small>
                <strong>{selectedBooking.pickupDate || selectedBooking.date} {selectedBooking.pickupTime ? `at ${selectedBooking.pickupTime}` : ''}</strong>
              </div>
              <div>
                <small>Vehicle Category</small>
                <strong>{selectedBooking.vehicleCategory || selectedBooking.cab} {selectedBooking.vehicleName ? `(${selectedBooking.vehicleName})` : ''}</strong>
              </div>
              <div>
                <small>Estimated Fare</small>
                <strong>₹{Number(selectedBooking.estimatedFare || selectedBooking.fare).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <small>Assigned Driver</small>
                <strong>{selectedBooking.driver || 'Pending Assignment'}</strong>
              </div>
            </div>

            <button
              className="primary-button modal-done"
              type="button"
              style={{ marginTop: '20px' }}
              onClick={() => setSelectedBooking(null)}
            >
              Done
            </button>
          </section>
        </div>
      )}
    </section>
  )
}

function SearchIcon() {
  return <span className="empty-search-mark">⌕</span>
}
