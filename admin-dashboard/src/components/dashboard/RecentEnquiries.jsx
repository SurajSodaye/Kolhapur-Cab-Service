import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge.jsx'
import { recentEnquiries } from '../../mock/dashboard.js'

export default function RecentEnquiries({ data }) {
  const list = data && data.length > 0
    ? data.slice(0, 4).map((item) => ({
        name: item.customerName || item.name || 'Customer',
        phone: item.phone || '',
        type: item.type || item.subject || 'General Enquiry',
        date: item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-IN') : 'Recent',
        status: item.status || 'New',
      }))
    : recentEnquiries

  return (
    <section className="panel enquiries-panel">
      <div className="panel-heading"><div><h2>Recent enquiries</h2><p>Latest customer requests</p></div><Link className="panel-icon-link" to="/enquiries" aria-label="View all enquiries"><ArrowUpRight size={17} /></Link></div>
      <div className="enquiry-list">{list.map((enquiry, idx) => <article className="enquiry-item" key={idx}><span className="enquiry-avatar">{enquiry.name.split(' ').map((part) => part[0]).join('')}</span><div className="enquiry-main"><div className="enquiry-title-row"><strong>{enquiry.name}</strong><StatusBadge status={enquiry.status} /></div><span>{enquiry.type} · {enquiry.date}</span><small>{enquiry.phone}</small></div></article>)}</div>
    </section>
  )
}
