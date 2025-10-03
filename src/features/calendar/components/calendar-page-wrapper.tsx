"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { DualSidebarLayout } from "@/components/sidebar"
import BigCalendar from "./big-calendar"
import { CalendarDataProvider } from "../contexts/calendar-data-context"
import { useCalendarSync } from "@/server/api-hooks/use-calendar-sync"
import { getAllUserEventsAction } from "../server/actions/get-all-user-events-action"
import { getUserSettingsAction } from "../server/actions/get-user-settings-action"
import { useCalendarStore } from "@/stores/calendar-store"

interface CalendarPageWrapperProps {
  userId: string
}

export default function CalendarPageWrapper({ userId }: CalendarPageWrapperProps) {
  const { setShowCurrentTime, setShowRecurringEvents } = useCalendarStore()
  const userIdNum = parseInt(userId, 10)
  
  // Validate user ID
  if (!userId || isNaN(userIdNum) || userIdNum <= 0) {
    return (
      <DualSidebarLayout>
        <div className="flex flex-1 flex-col py-3 sm:py-4 md:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground">Invalid User</h3>
              <p className="text-sm text-muted-foreground">Unable to load calendar data (ID: {userId})</p>
            </div>
          </div>
        </div>
      </DualSidebarLayout>
    )
  }
  
  // Sync calendars from database
  const { calendars: dbCalendars } = useCalendarSync(userIdNum)

  // Load events from database
  const { data: eventsData } = useSWR(
    `events-${userId}`, 
    async () => {
      const result = await getAllUserEventsAction(userIdNum)
      return result.success ? result.data : []
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 5000,
    }
  )

  // Load user settings
  const { data: userSettingsData } = useSWR(
    `user-settings-${userId}`, 
    async () => {
      const result = await getUserSettingsAction(userIdNum)
      return result.success ? result.data : null
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
      dedupingInterval: 5000,
    }
  )

  const calendars = dbCalendars || []
  const events = eventsData || []

  // Load user settings into store when available
  useEffect(() => {
    if (userSettingsData) {
      setShowCurrentTime(userSettingsData.showCurrentTime ?? true)
      setShowRecurringEvents(userSettingsData.showRecurringEvents ?? true)
    }
  }, [userSettingsData, setShowCurrentTime, setShowRecurringEvents])

  return (
    <CalendarDataProvider events={events} calendars={calendars} userId={userIdNum}>
      <DualSidebarLayout>
        <div className="flex flex-1 flex-col">
          <BigCalendar userId={userId} />
        </div>
      </DualSidebarLayout>
    </CalendarDataProvider>
  )
}
