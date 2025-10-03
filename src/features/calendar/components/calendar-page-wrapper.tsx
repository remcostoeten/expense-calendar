"use client"

import { DualSidebarLayout } from "@/components/sidebar"
import BigCalendar from "./big-calendar"
import { useCalendarData } from "../hooks/use-calendar-data"

interface CalendarPageWrapperProps {
  userId: string
}

export default function CalendarPageWrapper({ userId }: CalendarPageWrapperProps) {
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
  
  // Use standardized calendar data hook
  const { events, calendars, userSettings, isLoading, error } = useCalendarData(userIdNum)

  if (isLoading) {
    return (
      <DualSidebarLayout>
        <div className="flex flex-1 flex-col py-3 sm:py-4 md:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground">Loading Calendar...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we load your calendar data</p>
            </div>
          </div>
        </div>
      </DualSidebarLayout>
    )
  }

  if (error) {
    return (
      <DualSidebarLayout>
        <div className="flex flex-1 flex-col py-3 sm:py-4 md:py-6 lg:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground">Error Loading Calendar</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </DualSidebarLayout>
    )
  }

  return (
    <DualSidebarLayout>
      <div className="flex flex-1 flex-col">
        <BigCalendar userId={userId} />
      </div>
    </DualSidebarLayout>
  )
}
