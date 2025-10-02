"use server"

import { getEvents, getEventsByDateRange } from "../queries/get-events"

export async function getEventsAction(calendarId: string) {
  try {
    const events = await getEvents(calendarId)
    return { success: true, data: events }
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return { success: false, error: "Failed to fetch events" }
  }
}

export async function getEventsByDateRangeAction(calendarId: string, startDate: Date, endDate: Date) {
  try {
    const events = await getEventsByDateRange(calendarId, startDate, endDate)
    return { success: true, data: events }
  } catch (error) {
    console.error("Failed to fetch events:", error)
    return { success: false, error: "Failed to fetch events" }
  }
}
