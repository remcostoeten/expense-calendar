"use server"

import { getAllUserEvents, getAllUserEventsByDateRange } from "../queries/get-all-user-events"

export async function getAllUserEventsAction(userId: number) {
  try {
    const events = await getAllUserEvents(userId)
    return { success: true, data: events }
  } catch (error) {
    console.error("Failed to fetch user events:", error)
    return { success: false, error: "Failed to fetch user events" }
  }
}

export async function getAllUserEventsByDateRangeAction(userId: number, startDate: Date, endDate: Date) {
  try {
    const events = await getAllUserEventsByDateRange(userId, startDate, endDate)
    return { success: true, data: events }
  } catch (error) {
    console.error("Failed to fetch user events:", error)
    return { success: false, error: "Failed to fetch user events" }
  }
}
