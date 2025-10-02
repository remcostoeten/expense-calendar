import { db } from "@/server/db"
import { eventIntegrations } from "@/server/schema"
import { eq } from "drizzle-orm"

/**
 * Gets the external ID for a local event from a specific provider
 */
export async function getExternalId(eventId: number, provider: string): Promise<string | null> {
  const integration = await db.query.eventIntegrations.findFirst({
    where: eq(eventIntegrations.eventId, eventId),
  })

  return integration?.externalId || null
}

/**
 * Stores the external ID mapping for a newly created event
 */
export async function storeExternalId(eventId: number, provider: string, externalId: string): Promise<void> {
  await db.insert(eventIntegrations).values({
    eventId,
    provider,
    externalId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoNothing()
}

/**
 * Updates the external ID mapping for an event
 */
export async function updateExternalId(eventId: number, provider: string, externalId: string): Promise<void> {
  await db.insert(eventIntegrations).values({
    eventId,
    provider,
    externalId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [eventIntegrations.eventId, eventIntegrations.provider],
    set: {
      externalId,
      updatedAt: new Date(),
    }
  })
}

/**
 * Removes the external ID mapping for an event (used when deleting events)
 */
export async function removeExternalId(eventId: number, provider?: string): Promise<void> {
  if (provider) {
    await db.delete(eventIntegrations).where(eq(eventIntegrations.eventId, eventId))
  } else {
    await db.delete(eventIntegrations).where(eq(eventIntegrations.eventId, eventId))
  }
}

