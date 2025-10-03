"use server"

import { getCalendars } from "../queries/get-calendars"

export async function getCalendarsAction(userId: number) {
  try {
    const calendars = await getCalendars(userId)
    return { success: true, data: calendars }
  } catch (error) {
    console.error("Failed to fetch calendars:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch calendars" 
    }
  }
}
