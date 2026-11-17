import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { mockNotifications } from '../data/mockNotifications.js'
import { subscribeBookings, subscribeEnquiries, subscribeCallbackRequests } from '../services/adminFirestoreService.js'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => mockNotifications.map((item) => ({ ...item })))

  // Listen to incoming bookings and enquiries to populate real-time notifications
  useEffect(() => {
    const unsubB = subscribeBookings((bookings) => {
      if (!bookings || !bookings.length) return
      setNotifications((current) => {
        const existingRelatedIds = new Set(current.map((n) => n.relatedId))
        const newItems = []
        bookings.forEach((b) => {
          if (!existingRelatedIds.has(b.id)) {
            newItems.push({
              id: `NTF-BKG-${b.id}`,
              title: `New booking: ${b.id}`,
              message: `${b.customerName || 'Customer'} requested ${b.tripType || 'cab'} (${b.pickupLocation} to ${b.dropLocation}).`,
              category: 'Booking',
              createdAt: b.createdAt || new Date().toISOString(),
              read: false,
              relatedId: b.id,
              relatedRoute: '/bookings',
              priority: 'High',
            })
          }
        })
        if (newItems.length > 0) {
          return [...newItems, ...current]
        }
        return current
      })
    })

    const unsubE = subscribeEnquiries((enquiries) => {
      if (!enquiries || !enquiries.length) return
      setNotifications((current) => {
        const existingRelatedIds = new Set(current.map((n) => n.relatedId))
        const newItems = []
        enquiries.forEach((e) => {
          if (!existingRelatedIds.has(e.id)) {
            newItems.push({
              id: `NTF-ENQ-${e.id}`,
              title: `New enquiry: ${e.id}`,
              message: `${e.customerName || 'Customer'}: ${e.subject || e.type || 'Travel enquiry'}.`,
              category: 'Enquiry',
              createdAt: e.createdDate || new Date().toISOString(),
              read: false,
              relatedId: e.id,
              relatedRoute: '/enquiries',
              priority: 'Normal',
            })
          }
        })
        if (newItems.length > 0) {
          return [...newItems, ...current]
        }
        return current
      })
    })

    const unsubC = subscribeCallbackRequests((callbacks) => {
      if (!callbacks || !callbacks.length) return
      setNotifications((current) => {
        const existingRelatedIds = new Set(current.map((n) => n.relatedId))
        const newItems = []
        callbacks.forEach((c) => {
          if (!existingRelatedIds.has(c.id)) {
            newItems.push({
              id: `NTF-CBK-${c.id}`,
              title: `Callback request: ${c.id}`,
              message: `${c.customerName || 'Customer'} requested callback at ${c.callbackTime || '10:00'}.`,
              category: 'Callback',
              createdAt: c.createdDate || new Date().toISOString(),
              read: false,
              relatedId: c.id,
              relatedRoute: '/callback-requests',
              priority: 'High',
            })
          }
        })
        if (newItems.length > 0) {
          return [...newItems, ...current]
        }
        return current
      })
    })

    return () => {
      unsubB()
      unsubE()
      unsubC()
    }
  }, [])

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    markRead: (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)),
    markUnread: (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: false } : item)),
    markAllRead: () => setNotifications((current) => current.map((item) => ({ ...item, read: true }))),
    deleteNotification: (id) => setNotifications((current) => current.filter((item) => item.id !== id)),
    clearNotifications: () => setNotifications([]),
  }), [notifications])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider.')
  return context
}
