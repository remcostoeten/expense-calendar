import { db } from "@/server/db"
import { eventReminders } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function getEventReminders(eventId: number) {
  const reminders = await db
    .select()
    .from(eventReminders)
    .where(eq(eventReminders.eventId, eventId))
    .orderBy(eventReminders.minutesBefore)

  return reminders
}
