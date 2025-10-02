import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Calendar {
  id: string
  name: string
  color: string
  isVisible: boolean
  isActive: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  color: string
  location?: string
  allDay?: boolean
  calendarId: string
  isRecurring?: boolean
  recurrenceRule?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly"
    interval: number
    endDate?: Date
    count?: number
  }
}

interface CalendarState {
  calendars: Calendar[]
  events: CalendarEvent[]
  showCurrentTime: boolean
  showRecurringEvents: boolean
  currentDate: Date

  // Calendar actions
  addCalendar: (calendar: Omit<Calendar, "id">) => void
  updateCalendar: (id: string, updates: Partial<Calendar>) => void
  deleteCalendar: (id: string) => void
  setCalendars: (calendars: Calendar[]) => void

  // Event actions
  addEvent: (event: Omit<CalendarEvent, "id">) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void

  // Visibility actions
  isColorVisible: (color: string) => boolean
  toggleColorVisibility: (color: string) => void
  setShowCurrentTime: (show: boolean) => void
  setShowRecurringEvents: (show: boolean) => void

  // Date navigation action
  setCurrentDate: (date: Date) => void

  // Query actions
  getUpcomingEvents: (limit?: number) => CalendarEvent[]
  getPreviousEvents: (limit?: number) => CalendarEvent[]
  getEventsForDate: (date: Date) => CalendarEvent[]
}

// Calendars will be loaded from database via useCalendarSync
const defaultCalendars: Calendar[] = []

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: defaultCalendars,
      events: [],
      showCurrentTime: true,
      showRecurringEvents: true,
      currentDate: new Date(),

      // Calendar actions
      addCalendar: (newCalendar) => {
        const id = `calendar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          calendars: [...state.calendars, { ...newCalendar, id }],
        }))
      },

      updateCalendar: (id, updates) => {
        set((state) => ({
          calendars: state.calendars.map((cal) => (cal.id === id ? { ...cal, ...updates } : cal)),
        }))
      },

      deleteCalendar: (id) => {
        set((state) => ({
          calendars: state.calendars.filter((cal) => cal.id !== id),
        }))
      },

      setCalendars: (calendars) => {
        set({ calendars })
      },

      // Event actions
      addEvent: (newEvent) => {
        const id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        set((state) => ({
          events: [...state.events, { ...newEvent, id }],
        }))
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) => (event.id === id ? { ...event, ...updates } : event)),
        }))
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }))
      },

      // Visibility actions
      isColorVisible: (color) => {
        const { calendars } = get()
        const calendar = calendars.find((cal) => cal.color === color)
        return calendar?.isVisible ?? false
      },

      toggleColorVisibility: (color) => {
        set((state) => ({
          calendars: state.calendars.map((cal) => (cal.color === color ? { ...cal, isVisible: !cal.isVisible } : cal)),
        }))
      },

      setShowCurrentTime: (show: boolean) => {
        set({ showCurrentTime: show })
      },

      setShowRecurringEvents: (show: boolean) => {
        set({ showRecurringEvents: show })
      },

      // Date navigation action
      setCurrentDate: (date: Date) => {
        set({ currentDate: date })
      },

      // Query actions
      getUpcomingEvents: (limit = 5) => {
        const { events, calendars, showRecurringEvents } = get()
        const now = new Date()
        return events
          .filter((event) => {
            const calendar = calendars.find((cal) => cal.color === event.color)
            return calendar?.isVisible && event.start >= now && (!event.isRecurring || showRecurringEvents)
          })
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .slice(0, limit)
      },

      getPreviousEvents: (limit = 10) => {
        const { events, calendars, showRecurringEvents } = get()
        const now = new Date()
        return events
          .filter((event) => {
            const calendar = calendars.find((cal) => cal.color === event.color)
            return calendar?.isVisible && event.end < now && (!event.isRecurring || showRecurringEvents)
          })
          .sort((a, b) => b.end.getTime() - a.end.getTime())
          .slice(0, limit)
      },

      getEventsForDate: (date: Date) => {
        const { events, calendars } = get()
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)

        return events.filter((event) => {
          const calendar = calendars.find((cal) => cal.color === event.color)
          if (!calendar?.isVisible) return false

          const eventStart = new Date(event.start)
          eventStart.setHours(0, 0, 0, 0)
          const eventEnd = new Date(event.end)
          eventEnd.setHours(0, 0, 0, 0)

          return targetDate >= eventStart && targetDate <= eventEnd
        })
      },
    }),
    {
      name: "calendar-store",
      partialize: (state) => ({
        calendars: state.calendars,
        events: state.events,
        showCurrentTime: state.showCurrentTime,
        showRecurringEvents: state.showRecurringEvents,
      }),
    },
  ),
)
