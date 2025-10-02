import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Calendar {
  id: string
  name: string
  color: string
  isVisible: boolean
  isActive: boolean
}

export interface ExternalProvider {
  id: string
  name: string
  provider: string // 'google', 'outlook', 'apple'
  isConnected: boolean
  isVisible: boolean
  color: string
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
  externalProviders: ExternalProvider[]
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

  // External provider actions
  setExternalProviders: (providers: ExternalProvider[]) => void
  updateExternalProvider: (id: string, updates: Partial<ExternalProvider>) => void
  toggleExternalProviderVisibility: (provider: string) => void
  isExternalProviderVisible: (provider: string) => boolean
}

// Calendars will be loaded from database via useCalendarSync
const defaultCalendars: Calendar[] = []
const defaultExternalProviders: ExternalProvider[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    provider: 'google',
    isConnected: false,
    isVisible: false,
    color: 'blue'
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    provider: 'outlook',
    isConnected: false,
    isVisible: false,
    color: 'emerald'
  },
  {
    id: 'apple-calendar',
    name: 'Apple Calendar',
    provider: 'apple',
    isConnected: false,
    isVisible: false,
    color: 'violet'
  }
]

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: defaultCalendars,
      externalProviders: defaultExternalProviders,
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
        const { events, calendars, externalProviders, showRecurringEvents } = get()
        const now = new Date()
        return events
          .filter((event) => {
            // Check if it's a local calendar event
            const calendar = calendars.find((cal) => cal.color === event.color)
            if (calendar?.isVisible) return true

            // Check if it's an external provider event
            const externalProvider = externalProviders.find((provider) => provider.provider === event.color)
            if (externalProvider?.isVisible && externalProvider?.isConnected) return true

            return false
          })
          .filter((event) => event.start >= now && (!event.isRecurring || showRecurringEvents))
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .slice(0, limit)
      },

      getPreviousEvents: (limit = 10) => {
        const { events, calendars, externalProviders, showRecurringEvents } = get()
        const now = new Date()
        return events
          .filter((event) => {
            // Check if it's a local calendar event
            const calendar = calendars.find((cal) => cal.color === event.color)
            if (calendar?.isVisible) return true

            // Check if it's an external provider event
            const externalProvider = externalProviders.find((provider) => provider.provider === event.color)
            if (externalProvider?.isVisible && externalProvider?.isConnected) return true

            return false
          })
          .filter((event) => event.end < now && (!event.isRecurring || showRecurringEvents))
          .sort((a, b) => b.end.getTime() - a.end.getTime())
          .slice(0, limit)
      },

      getEventsForDate: (date: Date) => {
        const { events, calendars, externalProviders } = get()
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)

        return events.filter((event) => {
          // Check if it's a local calendar event
          const calendar = calendars.find((cal) => cal.color === event.color)
          if (calendar?.isVisible) {
            const eventStart = new Date(event.start)
            eventStart.setHours(0, 0, 0, 0)
            const eventEnd = new Date(event.end)
            eventEnd.setHours(0, 0, 0, 0)
            return targetDate >= eventStart && targetDate <= eventEnd
          }

          // Check if it's an external provider event
          const externalProvider = externalProviders.find((provider) => provider.provider === event.color)
          if (externalProvider?.isVisible && externalProvider?.isConnected) {
            const eventStart = new Date(event.start)
            eventStart.setHours(0, 0, 0, 0)
            const eventEnd = new Date(event.end)
            eventEnd.setHours(0, 0, 0, 0)
            return targetDate >= eventStart && targetDate <= eventEnd
          }

          return false
        })
      },

      // External provider actions
      setExternalProviders: (providers) => {
        set({ externalProviders: providers })
      },

      updateExternalProvider: (id, updates) => {
        set((state) => ({
          externalProviders: state.externalProviders.map((provider) =>
            provider.id === id ? { ...provider, ...updates } : provider
          ),
        }))
      },

      toggleExternalProviderVisibility: (provider) => {
        set((state) => ({
          externalProviders: state.externalProviders.map((p) =>
            p.provider === provider ? { ...p, isVisible: !p.isVisible } : p
          ),
        }))
      },

      isExternalProviderVisible: (provider) => {
        const { externalProviders } = get()
        const externalProvider = externalProviders.find((p) => p.provider === provider)
        return externalProvider?.isVisible ?? false
      },
    }),
    {
      name: "calendar-store",
      partialize: (state) => ({
        calendars: state.calendars,
        externalProviders: state.externalProviders,
        events: state.events,
        showCurrentTime: state.showCurrentTime,
        showRecurringEvents: state.showRecurringEvents,
      }),
    },
  ),
)
