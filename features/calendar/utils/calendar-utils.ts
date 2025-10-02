import { startOfDay, endOfDay, isWithinInterval } from "date-fns"
import type { TCalendarEvent } from "../components/event-calendar"
import type { Calendar as DbCalendar } from "@/server/schema"
import type { Calendar as StoreCalendar } from "@/stores/calendar-store"
import { getColorClasses } from "@/lib/colors"

export function getEventsForDay(events: TCalendarEvent[], day: Date) {
  return events.filter((event) => {
    const eventStart = startOfDay(event.start)
    const eventEnd = endOfDay(event.end)
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)

    return (
      isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
      isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
      isWithinInterval(eventStart, { start: dayStart, end: dayEnd })
    )
  })
}


export function convertDbCalendarsToStore(dbCalendars: DbCalendar[]): StoreCalendar[] {
  return dbCalendars.map((dbCalendar) => ({
    id: dbCalendar.id.toString(),
    name: dbCalendar.name,
    color: dbCalendar.color || "#3b82f6",
    isVisible: true,
    isActive: true,
  }))
}

