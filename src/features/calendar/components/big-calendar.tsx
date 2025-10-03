"use client"

import { useMemo, useEffect, useRef } from "react"
import { type TCalendarEvent, EventCalendar } from "./event-calendar"
import { CalendarShell } from "./calendar-shell"
import { useCalendarData } from "../hooks/use-calendar-data"
import { useCalendarStore } from "@/stores/calendar-store"
import type { Event, Calendar } from "@/server/schema"
import { COLOR_MAP } from "@/lib/colors"


type TProps = {
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

export default function BigCalendar({ userId }: TProps) {
  const userIdNum = parseInt(userId, 10)
  const { events, calendars } = useCalendarStore()
  const { calendar, calendarManagement } = useCalendarData(userIdNum)
  const initializationRef = useRef(false)
  
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
        await calendar.createDefaultCalendars.execute({ userId: userIdNum })
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
  }, [calendars.length, userIdNum, calendar.createDefaultCalendars])

  const calendarEvents = useMemo(() => {
    return events.map((event) => mapEventToCalendarEvent(event, calendars))
  }, [events, calendars])

  async function handleEventAdd(event: TCalendarEvent) {
    const calendar = calendars.find((cal) => COLOR_MAP[cal.color || ""] === event.color)
    if (!calendar) {
      console.error("No calendar found for color:", event.color)
      return
    }

    await calendar.createEvent.execute({
      calendarId: calendar.id,
      userId: userIdNum,
      title: event.title,
      description: event.description,
      startTime: event.start,
      endTime: event.end,
      location: event.location,
      allDay: event.allDay,
    })
  }

  async function handleEventUpdate(updatedEvent: TCalendarEvent) {
    await calendar.updateEvent.execute({
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
  }

  async function handleEventDelete(eventId: string) {
    await calendar.deleteEvent.execute({ eventId })
  }

  async function handleCalendarCreated() {
    // Calendar creation is handled by the optimistic updates
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
