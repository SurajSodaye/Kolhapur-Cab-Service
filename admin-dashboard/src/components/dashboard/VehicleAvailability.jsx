import { CarFront } from 'lucide-react'
import { vehicles } from '../../mock/dashboard.js'

const availability = [
  { label: 'Available', value: vehicles.available, color: '#16A34A' },
  { label: 'Assigned', value: vehicles.assigned, color: '#2563EB' },
  { label: 'Maintenance', value: vehicles.maintenance, color: '#F59E0B' },
]

export default function VehicleAvailability() {
  return (
    <section className="panel vehicle-panel">
      <div className="panel-heading"><div><h2>Vehicle availability</h2><p>Fleet status at a glance</p></div><span className="vehicle-total-icon"><CarFront size={18} /></span></div>
      <div className="vehicle-total"><strong>{vehicles.total}</strong><span>Total vehicles</span></div>
      <div className="availability-bar">{availability.map((item) => <span key={item.label} style={{ width: `${(item.value / vehicles.total) * 100}%`, backgroundColor: item.color }} title={`${item.label}: ${item.value}`} />)}</div>
      <div className="availability-list">{availability.map((item) => <div key={item.label}><span><i style={{ backgroundColor: item.color }} />{item.label}</span><strong>{item.value}</strong></div>)}</div>
    </section>
  )
}
