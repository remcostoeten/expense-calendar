import { db } from "@/server/db"
import { events } from "@/server/schema"
import { eq } from "drizzle-orm"

type EventUpdate = Partial<typeof events.$inferInsert>

export async function updateEvent(eventId: string, updates: EventUpdate) {
  const [updatedEvent] = await db
    .update(events)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning()

  return updatedEvent
}