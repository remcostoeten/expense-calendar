"use client"

import { useMemo, useEffect, useRef } from "react"
import useSWR from "swr"
import { type TCalendarEvent, EventCalendar } from "./event-calendar"
import { CalendarShell } from "./calendar-shell"
import { useCalendar } from "@/server/api-hooks/use-calendar"
import { useCalendarSync } from "@/server/api-hooks/use-calendar-sync"
import { useCalendarData } from "../contexts/calendar-data-context"
import type { Event, Calendar } from "@/server/schema"

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
  const { events, calendars } = useCalendarData()
  const userIdNum = parseInt(userId, 10)
  const initializationRef = useRef(false)
  
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
  
  // We need mutate functions for updating data after operations
  const { mutate: mutateCalendars } = useCalendarSync(userIdNum)
  const { mutate: mutateEvents } = useSWR(`events-${userId}`, null)

  const isLoading = false // Loading is handled by the wrapper
  const hasData = calendars.length > 0 || events.length > 0

  useEffect(() => {
    async function initializeCalendars() {
      // Only initialize once and only if we have calendar data and no calendars exist
      if (initializationRef.current || calendars.length > 0) {
        return
      }

      initializationRef.current = true

      try {
        await calendarHook.createDefaultCalendars.execute({ userId: userIdNum })
        await mutateCalendars()
      } catch (error) {
        console.error("Error creating default calendars:", error)
        // Reset the flag on error so it can retry
        initializationRef.current = false
      }
    }

    // Only run when we have no calendars and haven't initialized yet
    if (!initializationRef.current && calendars.length === 0) {
      initializeCalendars()
    }
  }, [calendars.length, userIdNum, calendarHook.createDefaultCalendars, mutateCalendars])

  const calendarEvents = useMemo(() => {
    return events.map((event) => mapEventToCalendarEvent(event, calendars))
  }, [events, calendars])

  async function handleEventAdd(event: TCalendarEvent) {
    const calendar = calendars.find((cal) => COLOR_MAP[cal.color || ""] === event.color)
    if (!calendar) {
      console.error("No calendar found for color:", event.color)
      return
    }

    try {
      await calendarHook.createEvent.execute({
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

  async function handleEventUpdate(updatedEvent: TCalendarEvent) {
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

  async function handleEventDelete(eventId: string) {
    await calendarHook.deleteEvent.execute({ eventId })
    mutateEvents()
  }

  async function handleCalendarCreated() {
    await mutateCalendars()
  }

  return (
    <CalendarShell 
      isLoading={isLoading} 
      hasData={hasData}
      view="week"
    >
      <EventCalendar
        events={calendarEvents}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
        initialView="week"
        userId={userIdNum}
        onCalendarCreated={handleCalendarCreated}
      />
    </CalendarShell>
  )
}
