import { db } from "@/server/db"
import { events, calendars } from "@/server/schema"
import { eq, and, gte, lte, inArray } from "drizzle-orm"

export async function getAllUserEvents(userId: number) {
  const userCalendars = await db.select({ id: calendars.id }).from(calendars).where(eq(calendars.userId, userId))

  const calendarIds = userCalendars.map((cal) => cal.id)

  if (calendarIds.length === 0) {
    return []
  }

  const userEvents = await db
    .select()
    .from(events)
    .where(inArray(events.calendarId, calendarIds))
    .orderBy(events.startTime)

  return userEvents
}

export async function getAllUserEventsByDateRange(userId: number, startDate: Date, endDate: Date) {
  const userCalendars = await db.select({ id: calendars.id }).from(calendars).where(eq(calendars.userId, userId))

  const calendarIds = userCalendars.map((cal) => cal.id)

  if (calendarIds.length === 0) {
    return []
  }

  const userEvents = await db
    .select()
    .from(events)
    .where(and(inArray(events.calendarId, calendarIds), gte(events.startTime, startDate), lte(events.endTime, endDate)))
    .orderBy(events.startTime)

  return userEvents
}
