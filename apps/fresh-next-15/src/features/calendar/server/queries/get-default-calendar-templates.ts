import { db } from "@/server/db"
import { defaultCalendarTemplates } from "@/server/schema"
import { asc } from "drizzle-orm"

export async function getDefaultCalendarTemplates() {
  const templates = await db
    .select()
    .from(defaultCalendarTemplates)
    .orderBy(asc(defaultCalendarTemplates.sortOrder))

  return templates
}