"use server"

import { revalidatePath } from "next/cache"
import { updateEvent } from "../mutations/update-event"

export async function updateEventAction(
  eventId: string,
  data: {
    title?: string
    description?: string
    startTime?: Date
    endTime?: Date
    location?: string
    isAllDay?: boolean
  },
) {
  try {
    const event = await updateEvent(eventId, data)
    revalidatePath("/dashboard/calendar")
    return { success: true, data: event }
  } catch (error) {
    console.error("Failed to update event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update event",
    }
  }
}
