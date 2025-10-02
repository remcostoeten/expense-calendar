import { db } from "@/server/db"
import { events } from "@/server/schema"
import { eq, and, gte, lte } from "drizzle-orm"

export async function getEvents(calendarId: number) {
  const calendarEvents = await db
    .select()
    .from(events)
    .where(eq(events.calendarId, calendarId))
    .orderBy(events.startTime)

  return calendarEvents
}

export async function getEventsByDateRange(calendarId: number, startDate: Date, endDate: Date) {
  const calendarEvents = await db
    .select()
    .from(events)
    .where(and(eq(events.calendarId, calendarId), gte(events.startTime, startDate), lte(events.endTime, endDate)))
    .orderBy(events.startTime)

  return calendarEvents
}