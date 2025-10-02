"use client"

import { useMemo, useEffect, useRef } from "react"
import useSWR from "swr"
import { type TCalendarEvent, EventCalendar } from "./event-calendar"
import { useCalendar } from "@/server/api-hooks/use-calendar"
import { useCalendarSync } from "@/server/api-hooks/use-calendar-sync"
import { getDefaultCalendars } from "../utils/calendar-utils"

const COLOR_MAP: Record<string, string> = {
  "#10b981": "emerald",
  "#f97316": "orange",
  "#8b5cf6": "violet",
  "#3b82f6": "blue",
  "#f43f5e": "rose",
  "#06b6d4": "cyan",
  "#ec4899": "pink",
  "#ef4444": "red",
  "#f59e0b": "amber",
  "#14b8a6": "teal",
  "#6366f1": "indigo",
  "#d946ef": "purple",
}
import { getAllUserEventsAction } from "../server/actions/get-all-user-events-action"
import { getUserSettingsAction } from "../server/actions/get-user-settings-action"
import type { Event, Calendar } from "@/server/schema"
import { useCalendarStore } from "@/stores/calendar-store"

interface BigCalendarProps {
  userId: string
}



function mapEventToCalendarEvent(event: Event, calendars: Calendar[]): TCalendarEvent {
  const calendar = calendars.find((cal) => cal.id === event.calendarId)
  const color = calendar?.color ? COLOR_MAP[calendar.color] || "blue" : "blue"

  return {
    id: event.id.toString(),
    title: event.title,
    description: event.description || undefined,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    color,
    location: event.location || undefined,
    allDay: event.allDay || false,
  }
}

export default function BigCalendar({ userId }: BigCalendarProps) {
  const calendarHook = useCalendar()
  const { setShowCurrentTime, setShowRecurringEvents } = useCalendarStore()
  const userIdNum = parseInt(userId, 10)
  const initializationRef = useRef(false)
  
  // Debug logging (temporarily enabled)
  console.log("BigCalendar received userId:", userId, "parsed as:", userIdNum)
  
  // Validate user ID
  if (!userId || isNaN(userIdNum) || userIdNum <= 0) {
    console.error("Invalid user ID:", { userId, userIdNum })
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">Invalid User</h3>
          <p className="text-sm text-muted-foreground">Unable to load calendar data (ID: {userId})</p>
        </div>
      </div>
    )
  }
  
  // Sync calendars from database with store
  const { calendars: dbCalendars, mutate: mutateCalendars } = useCalendarSync(userIdNum)



  const { data: eventsData, mutate: mutateEvents } = useSWR(
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

  const calendars = dbCalendars
  const events = eventsData || []

  // Load user settings into store when available
  useEffect(() => {
    if (userSettingsData) {
      setShowCurrentTime(userSettingsData.showCurrentTime ?? true)
      setShowRecurringEvents(userSettingsData.showRecurringEvents ?? true)
    }
  }, [userSettingsData, setShowCurrentTime, setShowRecurringEvents])

  useEffect(() => {
    const initializeCalendars = async () => {
      // Only initialize once and only if we have calendar data and no calendars exist
      if (initializationRef.current || calendars.length > 0) {
        return
      }

      initializationRef.current = true

      const defaultCalendars = getDefaultCalendars(userIdNum)

      try {
        for (const cal of defaultCalendars) {
          await calendarHook.createCalendar.execute({
            userId: cal.userId,
            name: cal.name,
            description: cal.description,
            color: cal.color,
            isDefault: cal.isDefault,
          })
        }
        await mutateCalendars()
      } catch (error) {
        console.error("Error creating default calendars:", error)
        // Reset the flag on error so it can retry
        initializationRef.current = false
      }
    }

    initializeCalendars()
  }, [calendars.length, userIdNum]) // Removed calendarHook.createCalendar and mutateCalendars to prevent loops

  const calendarEvents = useMemo(() => {
    return events.map((event) => mapEventToCalendarEvent(event, calendars))
  }, [events, calendars])

  const handleEventAdd = async (event: TCalendarEvent) => {
    const calendar = calendars.find((cal) => COLOR_MAP[cal.color || ""] === event.color)
    if (!calendar) {
      console.error("No calendar found for color:", event.color)
      return
    }

    try {
      const result = await calendarHook.createEvent.execute({
        calendarId: calendar.id,
        userId: userIdNum,
        title: event.title,
        description: event.description,
        startTime: event.start,
        endTime: event.end,
        location: event.location,
        allDay: event.allDay,
      })

      await mutateEvents()
    } catch (error) {
      console.error("Error creating event:", error)
    }
  }

  const handleEventUpdate = async (updatedEvent: TCalendarEvent) => {
    await calendarHook.updateEvent.execute({
      eventId: updatedEvent.id,
      data: {
        title: updatedEvent.title,
        description: updatedEvent.description,
        startTime: updatedEvent.start,
        endTime: updatedEvent.end,
        location: updatedEvent.location,
        allDay: updatedEvent.allDay,
      },
    })

    mutateEvents()
  }

  const handleEventDelete = async (eventId: string) => {
    await calendarHook.deleteEvent.execute({ eventId })
    mutateEvents()
  }

  const handleCalendarCreated = async () => {
    await mutateCalendars()
  }

  return (
    <EventCalendar
      events={calendarEvents}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="week"
      userId={userIdNum}
      onCalendarCreated={handleCalendarCreated}
    />
  )
}
