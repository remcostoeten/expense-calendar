import { Event, UserIntegration } from "@/server/schema"
import { db } from "@/server/db"
import { google } from "googleapis"
import { mapExternalCalendarToLocal } from "../calendar-mapping"
import { getExternalId, storeExternalId, removeExternalId } from "../event-integration-utils"

export async function syncGoogleEvent(integration: UserIntegration, event: Event, action: "create" | "update" | "delete") {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  })

  const calendar = google.calendar({ version: "v3", auth })

  if (action === "create") {
    try {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: event.title,
          description: event.description || "",
          location: event.location || "",
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: "UTC",
          },
        },
      })

      // Store the external ID mapping
      await storeExternalId(event.id, "google", response.data.id!)

    } catch (error) {
      console.error("Failed to sync event to Google Calendar:", error)
      throw error
    }
  }

  if (action === "update" || action === "delete") {
    // Look up the external ID
    const externalId = await getExternalId(event.id, "google")

    if (!externalId) {
      console.error(`No external ID found for event ${event.id}`)
      return
    }

    if (action === "update") {
      await calendar.events.update({
        calendarId: "primary",
        eventId: externalId,
        requestBody: {
          summary: event.title,
          description: event.description || "",
          location: event.location || "",
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: "UTC",
          },
        },
      })
    } else if (action === "delete") {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: externalId,
      })
      // Remove the integration mapping
      await removeExternalId(event.id, "google")
    }
  }
}

export async function fetchGoogleEvents(integration: UserIntegration): Promise<Array<Event & { externalId: string; provider: string }>> {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  })

  const calendar = google.calendar({ version: "v3", auth })

  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: "startTime",
    })

    const events = response.data.items || []

    // Get or create calendar mapping for Google primary calendar
    const calendarId = await mapExternalCalendarToLocal(integration.userId, "google", "primary")

    if (!calendarId) {
      console.error("No calendar mapping found for Google integration")
      return []
    }

    return events.map((e: any) => ({
      id: 0, // Will be set by DB
      externalId: e.id,
      provider: "google",
      title: e.summary || "Untitled Event",
      description: e.description || null,
      startTime: new Date(e.start?.dateTime || e.start?.date),
      endTime: new Date(e.end?.dateTime || e.end?.date),
      location: e.location || null,
      allDay: !e.start?.dateTime, // If no dateTime, it's an all-day event
      userId: integration.userId,
      calendarId: calendarId,
      recurrenceRule: e.recurrence ? e.recurrence.join(";") : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  } catch (error) {
    console.error("Error fetching Google events:", error)
    return []
  }
}