import { db } from "@/server/db"
import { events } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function deleteEvent(eventId: string) {
  const [deletedEvent] = await db.delete(events).where(eq(events.id, eventId)).returning()

  return deletedEvent
}
