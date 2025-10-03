"use client"

import { useTransition } from "react"
import { useApi } from "@/hooks/use-api"
import { updateCalendarAction, deleteCalendarAction, reorderCalendarsAction } from "@/features/calendar/server/actions/calendar-management-actions"
import type { TCalendar } from "@/server/schema"

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

export function useUpdateCalendar(options?: {
  onSuccess?: (calendar: TCalendar) => void
  onError?: (error: string) => void
}) {
  return useApi<UpdateCalendarInput, TCalendar, TCalendar[]>({
    action: ({ calendarId, updates }) => updateCalendarAction(calendarId, updates),
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

export function useDeleteCalendar(options?: {
  onSuccess?: () => void
  onError?: (error: string) => void
}) {
  return useApi<DeleteCalendarInput, void, TCalendar[]>({
    action: ({ calendarId }) => deleteCalendarAction(calendarId),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    optimisticUpdate: (currentCalendars, input) => {
      if (!currentCalendars) return currentCalendars

      return currentCalendars.filter((calendar) => calendar.id !== input.calendarId)
    },
  })
}

export function useReorderCalendars(options?: {
  onSuccess?: () => void
  onError?: (error: string) => void
}) {
  const [isPending, startTransition] = useTransition()

  const apiHook = useApi<ReorderCalendarsInput, void, TCalendar[]>({
    action: ({ calendarOrders }) => reorderCalendarsAction(calendarOrders),
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

  return {
    execute: (input: ReorderCalendarsInput) => {
      startTransition(() => {
        apiHook.execute(input)
      })
    },
    isPending,
    error: apiHook.error,
    optimisticData: apiHook.optimisticData,
  }
}

export function useCalendarManagement() {
  const updateCalendar = useUpdateCalendar()
  const deleteCalendar = useDeleteCalendar()
  const reorderCalendars = useReorderCalendars()

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
