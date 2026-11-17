import { useLocation } from 'react-router-dom'
import { ArrowRight, BarChart3, BriefcaseBusiness, CarFront, ClipboardList, FileQuestion, MapPinned, MessageSquareText, Percent, PhoneCall, Settings, Star, UsersRound } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'

const icons = {
  Bookings: ClipboardList, Vehicles: CarFront, Drivers: UsersRound, Routes: MapPinned, Services: BriefcaseBusiness,
  Enquiries: MessageSquareText, 'Callback Requests': PhoneCall, Reviews: Star, Offers: Percent, Reports: BarChart3,
  Settings, 'Admin Profile': UsersRound,
}

export default function PlaceholderPage({ title, description }) {
  const Icon = icons[title] || FileQuestion
  const location = useLocation()
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="placeholder-card">
        <div className="placeholder-icon"><Icon size={25} strokeWidth={1.7} /></div>
        <p className="eyebrow">UPCOMING PHASE</p>
        <h2>{title} management is on the way</h2>
        <p>This module is part of the Kolhapur Cab Service admin workspace. Its management tools will be added in an upcoming phase.</p>
        <div className="placeholder-route"><span>Workspace</span><span>/</span><strong>{location.pathname.slice(1).replaceAll('-', ' ')}</strong></div>
        <span className="module-tag">Module development coming in upcoming phase <ArrowRight size={14} /></span>
      </div>
    </>
  )
}
