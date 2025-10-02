import { db } from "@/server/db"
import { events } from "@/server/schema"
import { eq, and } from "drizzle-orm"

type NewEvent = typeof events.$inferInsert

export async function createEvent(event: NewEvent) {
  // Check for existing event with same details to prevent duplicates
  const existingEvent = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.title, event.title),
        eq(events.startTime, event.startTime),
        eq(events.endTime, event.endTime),
        eq(events.calendarId, event.calendarId),
        eq(events.userId, event.userId)
      )
    )
    .limit(1)

  if (existingEvent.length > 0) {
    throw new Error("An identical event already exists")
  }

  const [newEvent] = await db.insert(events).values(event).returning()

  return newEvent
}