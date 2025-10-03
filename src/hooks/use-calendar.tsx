"use client"

import { useApi } from "@/hooks/use-api"
import { createEventAction } from "@/features/calendar/server/actions/create-event-action"
import { updateEventAction } from "@/features/calendar/server/actions/update-event-action"
import { deleteEventAction } from "@/features/calendar/server/actions/delete-event-action"
import { createCalendarAction } from "@/features/calendar/server/actions/create-calendar-action"
import type { TEvent, TCalendar } from "@/server/schema"

/**
 * Calendar hook for managing calendar events with optimistic updates.
 *
 * @example
 * ```tsx
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
 * ```
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
  eventId: number
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
  eventId: number
}

export type CreateCalendarInput = {
  userId: number
  name: string
  description?: string
  color?: string
  isDefault?: boolean
}

export function useCreateEvent(options?: {
  onSuccess?: (event: TEvent) => void
  onError?: (error: string) => void
}) {
  return useApi<CreateEventInput, TEvent, TEvent[]>({
    action: createEventAction,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentEvents, input) => {
      if (!currentEvents) return currentEvents

      const optimisticEvent: TEvent = {
        id: Date.now(),
        calendarId: input.calendarId,
        userId: input.userId,
        title: input.title,
        description: input.description || null,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location || null,
        allDay: input.allDay || false,
        recurrenceRule: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return [...currentEvents, optimisticEvent]
    },
  })
}

export function useUpdateEvent(options?: {
  onSuccess?: (event: TEvent) => void
  onError?: (error: string) => void
}) {
  return useApi<UpdateEventInput, TEvent, TEvent[]>({
    action: (input) => updateEventAction(input.eventId, input.data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentEvents, input) => {
      if (!currentEvents) return currentEvents

      return currentEvents.map((event) =>
        event.id === input.eventId ? { ...event, ...input.data, updatedAt: new Date() } : event,
      )
    },
  })
}

export function useDeleteEvent(options?: {
  onSuccess?: () => void
  onError?: (error: string) => void
}) {
  return useApi<DeleteEventInput, void, TEvent[]>({
    action: (input) => deleteEventAction(input.eventId),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentEvents, input) => {
      if (!currentEvents) return currentEvents

      return currentEvents.filter((event) => event.id !== input.eventId)
    },
  })
}

export function useCreateCalendar(options?: {
  onSuccess?: (calendar: TCalendar) => void
  onError?: (error: string) => void
}) {
  return useApi<CreateCalendarInput, TCalendar, TCalendar[]>({
    action: createCalendarAction,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentCalendars, input) => {
      if (!currentCalendars) return currentCalendars

      const optimisticCalendar: TCalendar = {
        id: Date.now(),
        userId: input.userId,
        name: input.name,
        description: input.description || null,
        color: input.color || "#3b82f6",
        isDefault: input.isDefault || false,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return [...currentCalendars, optimisticCalendar]
    },
  })
}

export function useCalendar() {
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const createCalendar = useCreateCalendar()

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
  }
}