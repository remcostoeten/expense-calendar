import { db } from "@/server/db"
import { calendars } from "@/server/schema"
import { eq } from "drizzle-orm"

type TProps = {
  name?: string
  color?: string
  sortOrder?: number
}

export async function updateCalendar(calendarId: number, updates: TProps) {
  const [updatedCalendar] = await db
    .update(calendars)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(calendars.id, calendarId))
    .returning()

  return updatedCalendar
}
