import { Event, UserIntegration } from "@/server/schema"
import { db } from "@/server/db"
import { mapExternalCalendarToLocal } from "../calendar-mapping"
import { getExternalId, storeExternalId, removeExternalId } from "../event-integration-utils"

// Apple Calendar uses CalDAV protocol
// This is a simplified implementation - in production you'd use a CalDAV library
export async function syncAppleEvent(integration: UserIntegration, event: Event, action: "create" | "update" | "delete") {
  // Apple Calendar sync via CalDAV
  const calDavUrl = "https://caldav.icloud.com" // or user's custom CalDAV server

  if (action === "create") {
    try {
      // Create CalDAV VEVENT
      const vevent = createVEvent(event)

      const response = await fetch(`${calDavUrl}/calendar/`, {
        method: "PUT",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${integration.userId}:${integration.appPassword}`).toString("base64")}`,
          "Content-Type": "text/calendar; charset=utf-8",
        },
        body: vevent,
      })

      if (!response.ok) {
        throw new Error(`CalDAV sync failed: ${response.statusText}`)
      }

      // For CalDAV, we'd need to extract the UID from the response or generate one
      // For now, we'll use the event ID as the external ID
      await storeExternalId(event.id, "apple", event.id.toString())

    } catch (error) {
      console.error("Error syncing to Apple Calendar:", error)
      throw error
    }
  }

  if (action === "update" || action === "delete") {
    // Look up the external ID
    const externalId = await getExternalId(event.id, "apple")

    if (!externalId) {
      console.error(`No external ID found for event ${event.id}`)
      return
    }

    if (action === "update") {
      // For updates, we'd need to send a modified VEVENT
      console.log("Apple event update not fully implemented yet")
    } else if (action === "delete") {
      // For deletion, we'd need to send a DELETE request to the specific event URL
      console.log("Apple event delete not fully implemented yet")
      // Remove the integration mapping
      await removeExternalId(event.id, "apple")
    }
  }
}

export async function fetchAppleEvents(integration: UserIntegration): Promise<Array<Event & { externalId: string; provider: string }>> {
  // Fetch events from CalDAV server
  const calDavUrl = "https://caldav.icloud.com" // or user's custom CalDAV server

  try {
    const response = await fetch(`${calDavUrl}/calendar/`, {
      method: "REPORT",
      headers: {
        "Authorization": `Basic ${Buffer.from(`${integration.userId}:${integration.appPassword}`).toString("base64")}`,
        "Content-Type": "application/xml; charset=utf-8",
        "Depth": "1",
      },
      body: `<?xml version="1.0" encoding="utf-8" ?>
        <C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
          <D:prop>
            <D:getetag/>
            <C:calendar-data/>
          </D:prop>
          <C:filter>
            <C:comp-filter name="VCALENDAR">
              <C:comp-filter name="VEVENT"/>
            </C:comp-filter>
          </C:filter>
        </C:calendar-query>`,
    })

    if (!response.ok) {
      throw new Error(`CalDAV fetch failed: ${response.statusText}`)
    }

    const xmlData = await response.text()

    // Get or create calendar mapping for Apple Calendar
    const calendarId = await mapExternalCalendarToLocal(integration.userId, "apple", "default")

    if (!calendarId) {
      console.error("No calendar mapping found for Apple integration")
      return []
    }

    // Parse CalDAV XML response and extract VEVENT data
    // This is simplified - you'd use a proper CalDAV/iCal parser
    const events = parseCalDavResponse(xmlData, integration.userId, calendarId)

    return events
  } catch (error) {
    console.error("Error fetching Apple Calendar events:", error)
    return []
  }
}

// Helper function to create VEVENT format
function createVEvent(event: Event): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const startTime = event.startTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  const endTime = event.endTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//Your App//EN
BEGIN:VEVENT
UID:${event.id}@yourapp.com
DTSTAMP:${now}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
END:VEVENT
END:VCALENDAR`
}

// Helper function to parse CalDAV XML response
function parseCalDavResponse(xmlData: string, userId: number, calendarId: number): Array<Event & { externalId: string; provider: string }> {
  // This is a very simplified parser
  // In production, use a proper XML/iCal parsing library like node-ical
  const events: Array<Event & { externalId: string; provider: string }> = []

  // Extract VEVENT blocks from XML
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g
  let match

  while ((match = veventRegex.exec(xmlData)) !== null) {
    const veventData = match[1]

    // Parse basic fields
    const uid = extractField(veventData, "UID") || ""
    const summary = extractField(veventData, "SUMMARY") || "Untitled Event"
    const description = extractField(veventData, "DESCRIPTION") || null
    const location = extractField(veventData, "LOCATION") || null
    const dtstart = extractField(veventData, "DTSTART")
    const dtend = extractField(veventData, "DTEND")

    if (dtstart && dtend) {
      events.push({
        id: 0, // Will be set by DB
        externalId: uid,
        provider: "apple",
        title: summary,
        description,
        startTime: parseICalDate(dtstart),
        endTime: parseICalDate(dtend),
        location,
        allDay: dtstart.length === 8, // YYYYMMDD format indicates all-day
        userId,
        calendarId: calendarId,
        recurrenceRule: null, // TODO: Parse RRULE
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  return events
}

// Helper function to extract field from VEVENT data
function extractField(veventData: string, fieldName: string): string | null {
  const regex = new RegExp(`${fieldName}[^:]*:(.*)`, "i")
  const match = veventData.match(regex)
  return match ? match[1].trim() : null
}

// Helper function to parse iCal date format
function parseICalDate(dateStr: string): Date {
  // Handle both YYYYMMDDTHHMMSSZ and YYYYMMDD formats
  if (dateStr.length === 8) {
    // All-day event: YYYYMMDD
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1 // Month is 0-indexed
    const day = parseInt(dateStr.substring(6, 8))
    return new Date(year, month, day)
  } else {
    // DateTime: YYYYMMDDTHHMMSSZ
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(4, 6)) - 1
    const day = parseInt(dateStr.substring(6, 8))
    const hour = parseInt(dateStr.substring(9, 11))
    const minute = parseInt(dateStr.substring(11, 13))
    const second = parseInt(dateStr.substring(13, 15))
    return new Date(Date.UTC(year, month, day, hour, minute, second))
  }
}