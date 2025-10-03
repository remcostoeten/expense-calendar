import { db } from "@/server/db"
import { defaultCalendarTemplates, calendars } from "@/server/schema"
import { asc } from "drizzle-orm"

export async function createDefaultCalendarsForUser(userId: number) {
  const templates = await db
    .select()
    .from(defaultCalendarTemplates)
    .orderBy(asc(defaultCalendarTemplates.sortOrder))

  let calendarData

  if (templates.length === 0) {
    // Create basic default calendars if no templates exist
    calendarData = [
      {
        userId,
        name: "Personal",
        description: "Personal events and appointments",
        color: "#3b82f6",
        isDefault: true,
      },
      {
        userId,
        name: "Work",
        description: "Work-related events and meetings",
        color: "#10b981",
        isDefault: false,
      }
    ]
  } else {
    calendarData = templates.map(template => ({
      userId,
      name: template.name,
      description: template.description,
      color: template.color,
      isDefault: template.isDefault,
    }))
  }

  const createdCalendars = await db
    .insert(calendars)
    .values(calendarData)
    .returning()

  return createdCalendars
}