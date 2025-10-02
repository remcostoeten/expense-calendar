"use server"

import { revalidatePath } from "next/cache"
import { createDefaultCalendarsForUser } from "../mutations/create-default-calendars"

export async function createDefaultCalendarsAction(data: { userId: number }) {
  try {
    const calendars = await createDefaultCalendarsForUser(data.userId)
    revalidatePath("/dashboard/calendar")
    return { success: true, data: calendars }
  } catch (error) {
    console.error("Failed to create default calendars:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create default calendars",
    }
  }
}