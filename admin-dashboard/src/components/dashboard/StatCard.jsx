import { ArrowUpRight, CarFront, CheckCheck, CircleDollarSign, Clock3, ClipboardList, ListChecks, MessageSquareText } from 'lucide-react'

const iconMap = {
  bookings: ClipboardList,
  pending: Clock3,
  confirmed: ListChecks,
  completed: CheckCheck,
  revenue: CircleDollarSign,
  vehicles: CarFront,
  enquiries: MessageSquareText,
}

export default function StatCard({ stat }) {
  const Icon = iconMap[stat.icon]
  return (
    <article className="stat-card">
      <div className="stat-card-top"><span className={`stat-icon stat-icon-${stat.icon}`}><Icon size={19} strokeWidth={1.9} /></span><span className={`stat-change ${stat.trend === 'neutral' ? 'stat-change-neutral' : ''}`}>{stat.trend === 'up' ? <ArrowUpRight size={14} /> : null}{stat.change}</span></div>
      <p className="stat-label">{stat.label}</p>
      <div className="stat-value-row"><strong className="stat-value">{stat.value}</strong><span className="stat-note">{stat.note}</span></div>
    </article>
  )
}
