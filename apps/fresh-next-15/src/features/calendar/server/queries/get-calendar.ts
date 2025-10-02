import { db } from "@/server/db"
import { calendars } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function getCalendar(calendarId: number) {
  const [calendar] = await db.select().from(calendars).where(eq(calendars.id, calendarId)).limit(1)

  return calendar
}
