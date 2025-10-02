"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { useCalendarStore } from "@/stores/calendar-store"
import { getCalendarsAction } from "@/features/calendar/server/actions/get-calendars-action"
import { convertDbCalendarsToStore } from "@/features/calendar/utils/calendar-utils"

export function useCalendarSync(userId: number) {
  const { setCalendars } = useCalendarStore()

  const { data: calendarsData, error, mutate } = useSWR(
    `calendars-${userId}`,
    async () => {
      const result = await getCalendarsAction(userId)
      return result.success ? result.data : []
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    }
  )

  // Sync database calendars with the store
  useEffect(() => {
    if (calendarsData) {
      const storeCalendars = convertDbCalendarsToStore(calendarsData)
      setCalendars(storeCalendars)
    }
  }, [calendarsData, setCalendars])

  return {
    calendars: calendarsData || [],
    isLoading: !calendarsData && !error,
    error,
    mutate,
  }
}