"use client"

import { useMemo, useEffect, useRef } from "react"
import useSWR from "swr"
import { type TCalendarEvent, EventCalendar } from "./event-calendar"
import { useCalendar } from "@/server/api-hooks/use-calendar"
import { useUserSettings } from "@/server/api-hooks/use-user-settings"
import { getAllUserEventsAction } from "../server/actions/get-all-user-events-action"
import { getCalendarsAction } from "../server/actions/get-calendars-action"
import { getUserSettingsAction } from "../server/actions/get-user-settings-action"
import type { Event, Calendar } from "@/server/schema"
import { useCalendarStore } from "@/stores/calendar-store"

export const etiquettes = [
  {
    id: "my-events",
    name: "My Events",
    color: "emerald",
    isVisible: true,
  },
  {
    id: "marketing-team",
    name: "Marketing Team",
    color: "orange",
    isVisible: true,
  },
  {
    id: "interviews",
    name: "Interviews",
    color: "violet",
    isVisible: true,
  },
  {
    id: "events-planning",
    name: "Events Planning",
    color: "blue",
    isVisible: true,
  },
  {
    id: "holidays",
    name: "Holidays",
    color: "rose",
    isVisible: true,
  },
]

interface BigCalendarProps {
  userId: string
}

const colorMap: Record<string, string> = {
  "#10b981": "emerald",
  "#f97316": "orange",
  "#8b5cf6": "violet",
  "#3b82f6": "blue",
  "#f43f5e": "rose",
}

function mapEventToCalendarEvent(event: Event, calendars: Calendar[]): TCalendarEvent {
  const calendar = calendars.find((cal) => cal.id === event.calendarId)
  const color = calendar?.color ? colorMap[calendar.color] || "blue" : "blue"

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
  const userSettingsHook = useUserSettings()
  const { setShowCurrentTime, setShowRecurringEvents } = useCalendarStore()
  const userIdNum = parseInt(userId, 10)
  const initializationRef = useRef(false)

  const { data: calendarsData, mutate: mutateCalendars } = useSWR(`calendars-${userId}`, async () => {
    const result = await getCalendarsAction(userIdNum)
    return result.success ? result.data : []
  })

  const { data: eventsData, mutate: mutateEvents } = useSWR(`events-${userId}`, async () => {
    const result = await getAllUserEventsAction(userIdNum)
    return result.success ? result.data : []
  })

  const { data: userSettingsData } = useSWR(`user-settings-${userId}`, async () => {
    const result = await getUserSettingsAction(userIdNum)
    return result.success ? result.data : null
  })

  const calendars = calendarsData || []
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
      if (initializationRef.current || !calendarsData || calendars.length > 0) {
        return
      }

      initializationRef.current = true
      console.log("[v0] No calendars found, creating default calendars...")

      const defaultCalendars = [
        { name: "My Events", color: "#10b981", description: "Personal events" },
        { name: "Marketing Team", color: "#f97316", description: "Marketing team events" },
        { name: "Interviews", color: "#8b5cf6", description: "Interview schedules" },
        { name: "Events Planning", color: "#3b82f6", description: "Event planning" },
        { name: "Holidays", color: "#f43f5e", description: "Holidays and time off" },
      ]

      try {
        for (const cal of defaultCalendars) {
          await calendarHook.createCalendar.execute({
            userId: userIdNum,
            name: cal.name,
            description: cal.description,
            color: cal.color,
            isDefault: cal.name === "My Events",
          })
        }
        console.log("[v0] Default calendars created successfully")
        await mutateCalendars()
      } catch (error) {
        console.error("[v0] Error creating default calendars:", error)
        // Reset the flag on error so it can retry
        initializationRef.current = false
      }
    }

    initializeCalendars()
  }, [calendarsData, calendars.length, userIdNum])

  const calendarEvents = useMemo(() => {
    return events.map((event) => mapEventToCalendarEvent(event, calendars))
  }, [events, calendars])

  const handleEventAdd = async (event: TCalendarEvent) => {
    console.log("[v0] Creating event:", event)
    console.log("[v0] Available calendars:", calendars)

    const calendar = calendars.find((cal) => colorMap[cal.color || ""] === event.color)
    if (!calendar) {
      console.error("[v0] No calendar found for color:", event.color)
      console.error(
        "[v0] Available colors:",
        calendars.map((c) => ({ id: c.id, color: c.color, mapped: colorMap[c.color || ""] })),
      )
      return
    }

    console.log("[v0] Using calendar:", calendar)

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

      console.log("[v0] Event created successfully:", result)
      await mutateEvents()
      console.log("[v0] Events refreshed")
    } catch (error) {
      console.error("[v0] Error creating event:", error)
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
    console.log("[v0] Calendar created, refreshing calendars list")
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
