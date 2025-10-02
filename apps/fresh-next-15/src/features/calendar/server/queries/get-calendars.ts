import { db } from "@/server/db"
import { calendars } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function getCalendars(userId: number) {
  const userCalendars = await db
    .select()
    .from(calendars)
    .where(eq(calendars.userId, userId))
    .orderBy(calendars.createdAt)

  return userCalendars
}
