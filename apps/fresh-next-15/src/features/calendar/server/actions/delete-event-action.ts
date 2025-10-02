"use server"

import { revalidatePath } from "next/cache"
import { deleteEvent } from "../mutations/delete-event"

export async function deleteEventAction(eventId: number) {
  try {
    await deleteEvent(eventId.toString())

    // Revalidate Next.js cache
    revalidatePath("/dashboard/calendar")

    return { success: true, data: null }
  } catch (error) {
    console.error("Failed to delete event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event",
    }
  }
}