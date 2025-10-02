import { startOfDay, endOfDay, isWithinInterval } from "date-fns"
import type { TCalendarEvent } from "../components/event-calendar"
import type { Calendar as DbCalendar } from "@/server/schema"
import type { Calendar as StoreCalendar } from "@/stores/calendar-store"

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

export function getColorClasses(color: string) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200",
    emerald: "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-200",
    orange: "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-200",
    violet: "bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-200",
    rose: "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200",
  }
  return (
    colorMap[color] ||
    "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
  )
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

