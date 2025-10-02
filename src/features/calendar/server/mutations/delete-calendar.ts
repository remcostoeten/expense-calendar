import { db } from "@/server/db"
import { calendars, events } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function deleteCalendar(calendarId: number) {
  await db.delete(events).where(eq(events.calendarId, calendarId))

  const [deletedCalendar] = await db
    .delete(calendars)
    .where(eq(calendars.id, calendarId))
    .returning()

  return deletedCalendar
}
