import { db } from "@/server/db"
import { defaultCalendarTemplates, calendars } from "@/server/schema"
import { asc } from "drizzle-orm"

export async function createDefaultCalendarsForUser(userId: number) {
  const templates = await db
    .select()
    .from(defaultCalendarTemplates)
    .orderBy(asc(defaultCalendarTemplates.sortOrder))

  if (templates.length === 0) {
    throw new Error("No default calendar templates found")
  }

  const calendarData = templates.map(template => ({
    userId,
    name: template.name,
    description: template.description,
    color: template.color,
    isDefault: template.isDefault,
  }))

  const createdCalendars = await db
    .insert(calendars)
    .values(calendarData)
    .returning()

  return createdCalendars
}