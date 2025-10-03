"use client"

import { useTransition } from "react"
import { useApi } from "@/hooks/use-api"
import { updateCalendarAction, deleteCalendarAction, reorderCalendarsAction } from "@/features/calendar/server/actions/calendar-management-actions"
import type { Calendar } from "@/server/schema"

/**
 * Calendar management hooks for updating, deleting, and reordering calendars
 */

export type UpdateCalendarInput = {
  calendarId: number
  updates: {
    name?: string
    color?: string
    description?: string
    sortOrder?: number
  }
}

export type DeleteCalendarInput = {
  calendarId: number
}

export type ReorderCalendarsInput = {
  calendarOrders: Array<{ id: number; sortOrder: number }>
}

export function useUpdateCalendar(initialCalendars: Calendar[] = [], options?: {
  onSuccess?: (calendar: Calendar) => void
  onError?: (error: string) => void
}) {
  return useApi<UpdateCalendarInput, Calendar, Calendar[]>({
    action: ({ calendarId, updates }) => updateCalendarAction(calendarId, updates),
    initialData: initialCalendars,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentCalendars, input) => {
      if (!currentCalendars) return currentCalendars

      return currentCalendars.map((calendar) =>
        calendar.id === input.calendarId
          ? { ...calendar, ...input.updates, updatedAt: new Date() }
          : calendar,
      )
    },
  })
}

export function useDeleteCalendar(initialCalendars: Calendar[] = [], options?: {
  onSuccess?: () => void
  onError?: (error: string) => void
}) {
  return useApi<DeleteCalendarInput, void, Calendar[]>({
    action: ({ calendarId }) => deleteCalendarAction(calendarId),
    initialData: initialCalendars,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentCalendars, input) => {
      if (!currentCalendars) return currentCalendars

      return currentCalendars.filter((calendar) => calendar.id !== input.calendarId)
    },
  })
}

export function useReorderCalendars(initialCalendars: Calendar[] = [], options?: {
  onSuccess?: () => void
  onError?: (error: string) => void
}) {
  return useApi<ReorderCalendarsInput, void, Calendar[]>({
    action: ({ calendarOrders }) => reorderCalendarsAction(calendarOrders),
    initialData: initialCalendars,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentCalendars, input) => {
      if (!currentCalendars) return currentCalendars

      const reorderedCalendars = [...currentCalendars]
      const orderMap = new Map(input.calendarOrders.map((order: { id: number; sortOrder: number }) => [order.id, order.sortOrder]))

      reorderedCalendars.sort((a, b) => {
        const aOrder = Number(orderMap.get(a.id)) ?? Number(a.sortOrder) ?? 0
        const bOrder = Number(orderMap.get(b.id)) ?? Number(b.sortOrder) ?? 0
        return aOrder - bOrder
      })

      return reorderedCalendars
    },
  })
}

export function useCalendarManagement(initialCalendars: Calendar[] = []) {
  const updateCalendar = useUpdateCalendar(initialCalendars)
  const deleteCalendar = useDeleteCalendar(initialCalendars)
  const reorderCalendars = useReorderCalendars(initialCalendars)

  return {
    updateCalendar: {
      execute: updateCalendar.execute,
      isPending: updateCalendar.isPending,
      error: updateCalendar.error,
      optimisticData: updateCalendar.optimisticData,
    },
    deleteCalendar: {
      execute: deleteCalendar.execute,
      isPending: deleteCalendar.isPending,
      error: deleteCalendar.error,
      optimisticData: deleteCalendar.optimisticData,
    },
    reorderCalendars: {
      execute: reorderCalendars.execute,
      isPending: reorderCalendars.isPending,
      error: reorderCalendars.error,
      optimisticData: reorderCalendars.optimisticData,
    },
  }
}
