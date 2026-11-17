import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { bookingStatuses, bookingTrends, monthlyRevenue } from '../../mock/dashboard.js'

const rupees = (value) => `₹${Number(value).toLocaleString('en-IN')}`

function ChartCard({ title, subtitle, children, className = '' }) {
  return <section className={`panel chart-card ${className}`}><div className="panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</section>
}

export function BookingOverviewChart() {
  return (
    <ChartCard title="Booking overview" subtitle="Bookings and completed trips this week">
      <div className="chart-legend"><span><i className="legend-blue" />Bookings</span><span><i className="legend-light-blue" />Completed</span></div>
      <div className="chart-area chart-area-line"><ResponsiveContainer width="100%" height="100%"><LineChart data={bookingTrends} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}><CartesianGrid stroke="#EEF1F5" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 11 }} /><Tooltip contentStyle={{ border: '1px solid #E5EAF1', borderRadius: 9, boxShadow: '0 8px 24px rgba(23,36,58,.08)' }} /><Line type="monotone" dataKey="bookings" name="Bookings" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} /><Line type="monotone" dataKey="completed" name="Completed" stroke="#8CB4FF" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div>
    </ChartCard>
  )
}

export function RevenueOverviewChart() {
  return (
    <ChartCard title="Revenue overview" subtitle="Monthly sample revenue" className="revenue-chart-card">
      <div className="revenue-summary"><strong>₹3,84,500</strong><span><span className="positive-dot" /> October</span></div>
      <div className="chart-area chart-area-bar"><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyRevenue} margin={{ top: 8, right: 5, left: -16, bottom: 0 }}><CartesianGrid stroke="#EEF1F5" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 11 }} dy={10} /><YAxis tickFormatter={(value) => `${value / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#8B95A5', fontSize: 10 }} /><Tooltip formatter={(value) => [rupees(value), 'Revenue']} contentStyle={{ border: '1px solid #E5EAF1', borderRadius: 9, boxShadow: '0 8px 24px rgba(23,36,58,.08)' }} /><Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div>
      <p className="chart-footnote">Sample data for demonstration only</p>
    </ChartCard>
  )
}

export function BookingStatusChart() {
  return (
    <ChartCard title="Booking status" subtitle="Current booking distribution" className="status-chart-card">
      <div className="status-chart-body">
        <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={bookingStatuses} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="91%" paddingAngle={3} stroke="none">{bookingStatuses.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ border: '1px solid #E5EAF1', borderRadius: 9 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>318</strong><span>Total trips</span></div></div>
        <div className="status-legend">{bookingStatuses.map((item) => <div key={item.name}><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
      </div>
    </ChartCard>
  )
}
