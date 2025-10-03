"use server"

import { revalidatePath } from "next/cache"
import { updateCalendar } from "../mutations/update-calendar"
import { deleteCalendar } from "../mutations/delete-calendar"
import { reorderCalendars } from "../mutations/reorder-calendars"
import { getCalendars } from "../queries/get-calendars"

/**
 * Updates a calendar's properties
 */
export async function updateCalendarAction(
  calendarId: number,
  updates: {
    name?: string
    color?: string
    description?: string
    sortOrder?: number
  }
) {
  try {
    await updateCalendar(calendarId, updates)
    revalidatePath("/dashboard/calendar")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update calendar",
    }
  }
}

/**
 * Deletes a calendar and all its associated events
 */
export async function deleteCalendarAction(calendarId: number) {
  try {
    await deleteCalendar(calendarId)
    revalidatePath("/dashboard/calendar")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete calendar",
    }
  }
}

/**
 * Reorders calendars by updating their sort order
 */
export async function reorderCalendarsAction(
  calendarOrders: Array<{ id: number; sortOrder: number }>
) {
  try {
    await reorderCalendars(calendarOrders)
    revalidatePath("/dashboard/calendar")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder calendars",
    }
  }
}

/**
 * Gets all calendars for a user with their sort order
 */
export async function getCalendarsForUserAction(userId: number) {
  try {
    const userCalendars = await getCalendars(userId)
    return { success: true, calendars: userCalendars }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get calendars",
      calendars: [],
    }
  }
}
