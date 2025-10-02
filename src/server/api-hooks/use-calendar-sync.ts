import { useEffect } from "react"
import useSWR from "swr"
import { useCalendarStore } from "@/stores/calendar-store"
import { getCalendarsAction } from "@/features/calendar/server/actions/get-calendars-action"
import { convertDbCalendarsToStore } from "@/features/calendar/utils/calendar-utils"
import { syncInFromProvider } from "@/features/calendar/server/services/sync-cal-provider"

export function useCalendarSync(userId: number) {
  const { setCalendars } = useCalendarStore()

  const { data: calendarsData, error, mutate } = useSWR(
    `calendars-${userId}`,
    async () => {
      const dbCalendars = await getCalendarsAction(userId)
      const externalEvents = await syncInFromProvider(userId)

      return dbCalendars.success ? dbCalendars.data : []
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  )

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
