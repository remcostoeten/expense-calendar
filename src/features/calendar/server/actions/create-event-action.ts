"use server"

import { revalidatePath } from "next/cache"
import { createEvent } from "../mutations/create-event"
import { syncOutToProvider } from "../services/sync-cal-provider"
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
    // 1️⃣ Insert into your DB (existing logic)
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

    // 2️⃣ Revalidate Next.js cache
    revalidatePath("/dashboard/calendar")

    // 3️⃣ Sync to external providers (Outlook/Google/Apple)
    // ⚡️ You can extend this list later with any provider
    try {
      await syncOutToProvider(data.userId, event, "create")
      console.log("Event synced to external providers successfully")
    } catch (syncError) {
      console.error("Failed to sync event to external providers:", syncError)
      // Don't fail the entire operation if sync fails - the event is still created locally
    }

    return { success: true, data: event }
  } catch (error) {
    console.error("Failed to create event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event",
    }
  }
}
