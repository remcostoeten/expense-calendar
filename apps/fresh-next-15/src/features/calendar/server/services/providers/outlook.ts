import { Event, UserIntegration } from "@/server/schema"
import { db } from "@/server/db"
import { Client } from "@microsoft/microsoft-graph-client"
import { mapExternalCalendarToLocal } from "../calendar-mapping"
import { getExternalId, storeExternalId, removeExternalId } from "../event-integration-utils"

export async function syncOutlookEvent(integration: UserIntegration, event: Event, action: "create" | "update" | "delete") {
    const client = Client.init({
        authProvider: (done) => done(null, integration.accessToken),
    })

    if (action === "create") {
        try {
            const response = await client.api("/me/events").post({
                subject: event.title,
                start: { dateTime: event.startTime.toISOString(), timeZone: "UTC" },
                end: { dateTime: event.endTime.toISOString(), timeZone: "UTC" },
                body: { content: event.description || "" },
                location: { displayName: event.location || "" },
            })

            // Store the external ID mapping
            await storeExternalId(event.id, "outlook", response.id)

        } catch (error) {
            console.error("Failed to sync event to Outlook:", error)
            throw error
        }
    }

    if (action === "update" || action === "delete") {
        // Look up the external ID
        const externalId = await getExternalId(event.id, "outlook")

        if (!externalId) {
            console.error(`No external ID found for event ${event.id}`)
            return
        }

        if (action === "update") {
            await client.api(`/me/events/${externalId}`).patch({
                subject: event.title,
                start: { dateTime: event.startTime.toISOString(), timeZone: "UTC" },
                end: { dateTime: event.endTime.toISOString(), timeZone: "UTC" },
                body: { content: event.description || "" },
                location: { displayName: event.location || "" },
            })
        } else if (action === "delete") {
            await client.api(`/me/events/${externalId}`).delete()
            // Remove the integration mapping
            await removeExternalId(event.id, "outlook")
        }
    }
}

export async function fetchOutlookEvents(integration: UserIntegration): Promise<Array<Event & { externalId: string; provider: string }>> {
    const client = Client.init({
        authProvider: (done) => done(null, integration.accessToken),
    })

    try {
        const res = await client.api("/me/events").get()
        const events = res.value || []

        // Get or create calendar mapping for Outlook primary calendar
        const calendarId = await mapExternalCalendarToLocal(integration.userId, "outlook", "primary")

        if (!calendarId) {
            console.error("No calendar mapping found for Outlook integration")
            return []
        }

        // Map external events to local calendar structure
        return events.map((e: any) => ({
            id: 0, // Will be set by DB
            externalId: e.id,
            provider: "outlook",
            title: e.subject || "Untitled Event",
            startTime: new Date(e.start?.dateTime || e.start?.date),
            endTime: new Date(e.end?.dateTime || e.end?.date),
            description: e.body?.content || null,
            location: e.location?.displayName || null,
            allDay: !e.start?.dateTime, // If no dateTime, it's an all-day event
            userId: integration.userId,
            calendarId: calendarId,
            recurrenceRule: null, // TODO: Parse recurrence
            createdAt: new Date(),
            updatedAt: new Date(),
        }))
    } catch (error) {
        console.error("Error fetching Outlook events:", error)
        return []
    }
}
