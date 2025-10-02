"use server"

import { revalidatePath } from "next/cache"
import { createCalendar } from "../mutations/create-calendar"

export async function createCalendarAction(data: {
  userId: number
  name: string
  description?: string
  color?: string
  isDefault?: boolean
}) {
  try {
    const calendar = await createCalendar({
      userId: data.userId,
      name: data.name,
      description: data.description && data.description.trim() ? data.description.trim() : null,
      color: data.color || "#3b82f6",
      isDefault: data.isDefault || false,
    })
    revalidatePath("/dashboard/calendar")
    return { success: true, data: calendar }
  } catch (error) {
    console.error("Failed to create calendar:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create calendar",
    }
  }
}
