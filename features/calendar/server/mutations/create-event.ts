import { db } from "@/server/db"
import { events } from "@/server/schema"

type NewEvent = typeof events.$inferInsert

export async function createEvent(event: NewEvent) {
  const [newEvent] = await db.insert(events).values(event).returning()

  return newEvent
}
