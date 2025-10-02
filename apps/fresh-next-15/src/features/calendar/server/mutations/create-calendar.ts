import { db } from "@/server/db"
import { calendars } from "@/server/schema"

type NewCalendar = typeof calendars.$inferInsert

export async function createCalendar(calendar: NewCalendar) {
  const [newCalendar] = await db.insert(calendars).values(calendar).returning()

  return newCalendar
}