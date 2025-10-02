"use server"

import { revalidatePath } from "next/cache"
import { deleteEvent } from "../mutations/delete-event"

export async function deleteEventAction(eventId: string) {
  try {
    await deleteEvent(eventId)
    revalidatePath("/dashboard/calendar")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete event",
    }
  }
}
