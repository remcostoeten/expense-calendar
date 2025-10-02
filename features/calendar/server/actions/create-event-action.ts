"use server"

import { revalidatePath } from "next/cache"
import { createEvent } from "../mutations/create-event"
import type { Event } from "@/server/schema"

export async function createEventAction(data: {
  calendarId: number
  userId: number
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  allDay?: boolean
}) {
  try {
    const event: Event = await createEvent({
      calendarId: data.calendarId,
      userId: data.userId,
      title: data.title,
      description: data.description || null,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location || null,
      allDay: data.allDay || false,
    })

    revalidatePath("/dashboard/calendar")

    // 3️⃣ Sync to external providers (Outlook/Google/Apple)
    // ⚡️ You can extend this list later with any provider
    await syncOutToProvider(data.userId, event, "create")

    return { success: true, data: event }
  } catch (error) {
    console.error("Failed to create event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event",
    }
  }
}
