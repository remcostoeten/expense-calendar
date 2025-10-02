import { db } from "@/server/db"
import { calendarIntegrations, calendars } from "@/server/schema"
import { eq } from "drizzle-orm"

/**
 * Maps an external calendar ID to a local calendar ID
 * For now, this uses a simple mapping strategy, but can be extended
 * to support multiple external calendars per provider
 */
export async function mapExternalCalendarToLocal(
  userId: number,
  provider: string,
  externalCalendarId: string
): Promise<number | null> {
  // First, try to find an existing mapping
  const existingMapping = await db.query.calendarIntegrations.findFirst({
    where: eq(calendarIntegrations.provider, provider),
  })

  if (existingMapping) {
    return existingMapping.calendarId
  }

  // If no mapping exists, create one using the user's default calendar
  const defaultCalendar = await db.query.calendars.findFirst({
    where: eq(calendars.userId, userId),
  })

  if (defaultCalendar) {
    // Create the mapping
    await db.insert(calendarIntegrations).values({
      calendarId: defaultCalendar.id,
      provider: provider,
      externalId: externalCalendarId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing()

    return defaultCalendar.id
  }

  return null
}

/**
 * Gets the external calendar ID for a given local calendar and provider
 */
export async function getExternalCalendarId(
  calendarId: number,
  provider: string
): Promise<string | null> {
  const mapping = await db.query.calendarIntegrations.findFirst({
    where: eq(calendarIntegrations.calendarId, calendarId),
  })

  return mapping?.externalId || null
}
