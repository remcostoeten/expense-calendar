"use server"

import { revalidatePath } from "next/cache"
import { createCalendar } from "../mutations/create-calendar"
import type { Calendar } from "@/server/schema"

export async function createCalendarAction(data: {
  userId: number
  name: string
  description?: string
  color?: string
  isDefault?: boolean
}) {
  try {
    const calendar: Calendar = await createCalendar({
      userId: data.userId,
      name: data.name,
      description: data.description || null,
      color: data.color || "#3b82f6",
      isDefault: data.isDefault || false,
      sortOrder: 0,
    })

    // Revalidate Next.js cache
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