"use server"

import { TEvent } from "@/server/schema"
import { db } from "@/server/db"
import { events, eventIntegrations } from "@/server/schema"
import { syncOutlookEvent, fetchOutlookEvents } from "./providers/outlook"
import { syncGoogleEvent, fetchGoogleEvents } from "./providers/google"
import { syncAppleEvent, fetchAppleEvents } from "./providers/apple"
import { syncLogger } from "./sync-logger"

// Type for external events that include provider info
type ExternalEvent = TEvent & {
  externalId: string
  provider: string
}

// This function is called AFTER a local DB event is created/updated/deleted
export async function syncOutToProvider(userId: number, event: TEvent, action: "create" | "update" | "delete") {
  syncLogger.info("syncOutToProvider", "system", userId, `Starting ${action} sync for event ${event.id}`)

  try {
    // Load user's connected providers from db (user_integrations table)
    const integrations = await db.query.userIntegrations.findMany({
      where: (u, { eq }) => eq(u.userId, userId),
    })

    if (integrations.length === 0) {
      syncLogger.warn("syncOutToProvider", "system", userId, "No provider integrations found for user")
      return
    }

    for (const integration of integrations) {
      try {
        switch (integration.provider) {
          case "outlook":
            await syncOutlookEvent(integration, event, action)
            syncLogger.info("syncOutToProvider", "outlook", userId, `${action} sync successful for event ${event.id}`)
            break
          case "google":
            await syncGoogleEvent(integration, event, action)
            syncLogger.info("syncOutToProvider", "google", userId, `${action} sync successful for event ${event.id}`)
            break
          case "apple":
            await syncAppleEvent(integration, event, action)
            syncLogger.info("syncOutToProvider", "apple", userId, `${action} sync successful for event ${event.id}`)
            break
          default:
            syncLogger.warn("syncOutToProvider", integration.provider, userId, `Unknown provider: ${integration.provider}`)
        }
      } catch (error) {
        syncLogger.error(
          "syncOutToProvider",
          integration.provider,
          userId,
          `${action} sync failed for event ${event.id}`,
          error as Error,
          { eventId: event.id, provider: integration.provider }
        )
        // Continue with other providers even if one fails
      }
    }
  } catch (error) {
    syncLogger.error(
      "syncOutToProvider",
      "system",
      userId,
      `Failed to load integrations for ${action} sync`,
      error as Error,
      { eventId: event.id }
    )
    throw error
  }
}

// This pulls fresh events from providers and upserts them locally
export async function syncInFromProvider(userId: number): Promise<TEvent[]> {
  syncLogger.info("syncInFromProvider", "system", userId, "Starting sync in from all providers")

  try {
    const integrations = await db.query.userIntegrations.findMany({
      where: (u, { eq }) => eq(u.userId, userId),
    })

    if (integrations.length === 0) {
      syncLogger.warn("syncInFromProvider", "system", userId, "No provider integrations found for user")
      return []
    }

    let allExternalEvents: ExternalEvent[] = []
    let totalFetched = 0

    for (const integration of integrations) {
      try {
        let fetchedEvents: ExternalEvent[] = []

        switch (integration.provider) {
          case "outlook":
            fetchedEvents = await fetchOutlookEvents(integration)
            break
          case "google":
            fetchedEvents = await fetchGoogleEvents(integration)
            break
          case "apple":
            fetchedEvents = await fetchAppleEvents(integration)
            break
          default:
            syncLogger.warn("syncInFromProvider", integration.provider, userId, `Unknown provider: ${integration.provider}`)
            continue
        }

        allExternalEvents = [...allExternalEvents, ...fetchedEvents]
        totalFetched += fetchedEvents.length

        syncLogger.info("syncInFromProvider", integration.provider, userId, `Fetched ${fetchedEvents.length} events`)

      } catch (error) {
        syncLogger.error(
          "syncInFromProvider",
          integration.provider,
          userId,
          "Failed to fetch events from provider",
          error as Error,
          { provider: integration.provider }
        )
        // Continue with other providers even if one fails
      }
    }

    syncLogger.info("syncInFromProvider", "system", userId, `Total events fetched: ${totalFetched}`)

    // Upsert into local DB
    const insertedEvents: TEvent[] = []

    for (const externalEvent of allExternalEvents) {
      try {
        // Extract the core event data (without provider-specific fields)
        const { externalId, provider, ...eventData } = externalEvent

        // First insert the event
        const [insertedEvent] = await db
          .insert(events)
          .values(eventData)
          .onConflictDoNothing()
          .returning()

        if (insertedEvent) {
          insertedEvents.push(insertedEvent)

          // Then create/update the integration mapping
          await db
            .insert(eventIntegrations)
            .values({
              eventId: insertedEvent.id,
              provider: provider,
              externalId: externalId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [eventIntegrations.externalId, eventIntegrations.provider],
              set: {
                eventId: insertedEvent.id,
                updatedAt: new Date(),
              }
            })

          syncLogger.info("syncInFromProvider", provider, userId, `Upserted event ${insertedEvent.id} from external ID ${externalId}`)
        }
      } catch (error) {
        syncLogger.error(
          "syncInFromProvider",
          "system",
          userId,
          "Failed to upsert event",
          error as Error,
          { externalEvent: externalEvent }
        )
        // Continue with other events even if one fails
      }
    }

    syncLogger.info("syncInFromProvider", "system", userId, `Successfully synced ${insertedEvents.length} events`)

    return insertedEvents

  } catch (error) {
    syncLogger.error(
      "syncInFromProvider",
      "system",
      userId,
      "Failed to complete sync in process",
      error as Error
    )
    throw error
  }
}