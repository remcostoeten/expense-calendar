import { db } from "@/server/db"
import { events } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function getEvent(eventId: number) {
  const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1)

  return event
}
