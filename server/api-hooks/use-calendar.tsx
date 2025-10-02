"use client"

import { useApi } from "@/hooks/use-api"
import { createEventAction } from "@/features/calendar/server/actions/create-event-action"
import { updateEventAction } from "@/features/calendar/server/actions/update-event-action"
import { deleteEventAction } from "@/features/calendar/server/actions/delete-event-action"
import { createCalendarAction } from "@/features/calendar/server/actions/create-calendar-action"
import { createDefaultCalendarsAction } from "@/features/calendar/server/actions/create-default-calendars-action"
import { cleanupDuplicateEventsAction } from "@/features/calendar/server/actions/cleanup-duplicate-events-action"
import type { Event, Calendar } from "@/server/schema"

/**
 * Calendar hook for managing calendar events with optimistic updates.
 *
 * @example
 * \`\`\`tsx
 * function CalendarComponent() {
 *   const calendar = useCalendar()
 *
 *   const handleCreateEvent = async () => {
 *     await calendar.createEvent.execute({
 *       calendarId: 123,
 *       userId: 456,
 *       title: 'Team Meeting',
 *       startTime: new Date('2025-10-01T10:00:00'),
 *       endTime: new Date('2025-10-01T11:00:00'),
 *       description: 'Quarterly planning',
 *       location: 'Conference Room A',
 *       allDay: false
 *     })
 *   }
 *
 *   const handleUpdateEvent = async (eventId: string) => {
 *     await calendar.updateEvent.execute({
 *       eventId,
 *       data: { title: 'Updated Meeting Title' }
 *     })
 *   }
 *
 *   const handleDeleteEvent = async (eventId: string) => {
 *     await calendar.deleteEvent.execute({ eventId })
 *   }
 *
 *   const handleCreateCalendar = async () => {
 *     await calendar.createCalendar.execute({
 *       userId: 456,
 *       name: 'Work Calendar',
 *       description: 'Calendar for work events',
 *       color: '#ff0000',
 *       isDefault: true
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={handleCreateEvent}
 *         disabled={calendar.createEvent.isPending}
 *       >
 *         {calendar.createEvent.isPending ? 'Creating...' : 'Create Event'}
 *       </button>
 *       {calendar.createEvent.error && <p>{calendar.createEvent.error}</p>}
 *
 *       <button
 *         onClick={handleCreateCalendar}
 *         disabled={calendar.createCalendar.isPending}
 *       >
 *         {calendar.createCalendar.isPending ? 'Creating Calendar...' : 'Create Calendar'}
 *       </button>
 *       {calendar.createCalendar.error && <p>{calendar.createCalendar.error}</p>}
 *     </div>
 *   )
 * }
 */

export type CreateEventInput = {
  calendarId: number
  userId: number
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  allDay?: boolean
}

export type UpdateEventInput = {
  eventId: string
  data: {
    title?: string
    description?: string
    startTime?: Date
    endTime?: Date
    location?: string
    allDay?: boolean
  }
}

export type DeleteEventInput = {
  eventId: string
}

export type CreateCalendarInput = {
  userId: number
  name: string
  description?: string
  color?: string
  isDefault?: boolean
}

export type CreateDefaultCalendarsInput = {
  userId: number
}

export type CleanupDuplicatesInput = {
  userId: number
}

export function useCreateEvent(options?: {
  onSuccess?: (event: Event) => void
  onError?: (error: string) => void
}) {
  return useApi<CreateEventInput, Event, Event[]>({
    action: createEventAction,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentEvents, input) => {
      if (!currentEvents) return currentEvents

      const optimisticEvent: Event = {
        id: Date.now(),
        calendarId: input.calendarId,
        userId: input.userId,
        title: input.title,
        description: input.description || null,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location || null,
        allDay: input.allDay || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return [...currentEvents, optimisticEvent]
    },
  })
}

export function useUpdateEvent(options?: {
  onSuccess?: (event: Event) => void
  onError?: (error: string) => void
}) {
  return useApi<UpdateEventInput, Event, Event[]>({
    action: (input) => updateEventAction(input.eventId, input.data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentEvents, input) => {
      if (!currentEvents) return currentEvents

      return currentEvents.map((event) =>
        event.id.toString() === input.eventId ? { ...event, ...input.data, updatedAt: new Date() } : event,
      )
    },
  })
}

export function useDeleteEvent(options?: {
  onSuccess?: () => void
  onError?: (error: string) => void
}) {
  return useApi<DeleteEventInput, void, Event[]>({
    action: (input) => deleteEventAction(input.eventId),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentEvents, input) => {
      if (!currentEvents) return currentEvents

      return currentEvents.filter((event) => event.id.toString() !== input.eventId)
    },
  })
}

export function useCreateCalendar(options?: {
  onSuccess?: (calendar: Calendar) => void
  onError?: (error: string) => void
}) {
  return useApi<CreateCalendarInput, Calendar, Calendar[]>({
    action: createCalendarAction,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentCalendars, input) => {
      if (!currentCalendars) return currentCalendars

      const optimisticCalendar: Calendar = {
        id: Date.now(),
        userId: input.userId,
        name: input.name,
        description: input.description || null,
        color: input.color || "#3b82f6",
        isDefault: input.isDefault || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return [...currentCalendars, optimisticCalendar]
    },
  })
}

export function useCreateDefaultCalendars(options?: {
  onSuccess?: (calendars: Calendar[]) => void
  onError?: (error: string) => void
}) {
  return useApi<CreateDefaultCalendarsInput, Calendar[], Calendar[]>({
    action: createDefaultCalendarsAction,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentCalendars) => {
      return currentCalendars
    },
  })
}

export function useCleanupDuplicates(options?: {
  onSuccess?: (result: { duplicateGroups: number; deletedEvents: number }) => void
  onError?: (error: string) => void
}) {
  return useApi<CleanupDuplicatesInput, { duplicateGroups: number; deletedEvents: number }>({
    action: (input) => cleanupDuplicateEventsAction(input.userId),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

export function useCalendar() {
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const createCalendar = useCreateCalendar()
  const createDefaultCalendars = useCreateDefaultCalendars()
  const cleanupDuplicates = useCleanupDuplicates()

  return {
    createEvent: {
      execute: createEvent.execute,
      isPending: createEvent.isPending,
      error: createEvent.error,
      optimisticData: createEvent.optimisticData,
    },
    updateEvent: {
      execute: updateEvent.execute,
      isPending: updateEvent.isPending,
      error: updateEvent.error,
      optimisticData: updateEvent.optimisticData,
    },
    deleteEvent: {
      execute: deleteEvent.execute,
      isPending: deleteEvent.isPending,
      error: deleteEvent.error,
      optimisticData: deleteEvent.optimisticData,
    },
    createCalendar: {
      execute: createCalendar.execute,
      isPending: createCalendar.isPending,
      error: createCalendar.error,
      optimisticData: createCalendar.optimisticData,
    },
    createDefaultCalendars: {
      execute: createDefaultCalendars.execute,
      isPending: createDefaultCalendars.isPending,
      error: createDefaultCalendars.error,
      optimisticData: createDefaultCalendars.optimisticData,
    },
    cleanupDuplicates: {
      execute: cleanupDuplicates.execute,
      isPending: cleanupDuplicates.isPending,
      error: cleanupDuplicates.error,
    },
  }
}
