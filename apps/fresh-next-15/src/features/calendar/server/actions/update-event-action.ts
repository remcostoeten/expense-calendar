"use server"

import { revalidatePath } from "next/cache"
import { updateEvent } from "../mutations/update-event"
import type { Event } from "@/server/schema"

export async function updateEventAction(eventId: number, data: {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  location?: string
  allDay?: boolean
}) {
  try {
    const event: Event = await updateEvent(eventId.toString(), data)

    // Revalidate Next.js cache
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