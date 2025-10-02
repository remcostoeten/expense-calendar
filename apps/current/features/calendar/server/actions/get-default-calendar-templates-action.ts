"use server"

import { getDefaultCalendarTemplates } from "../repository/default-calendar-templates-repository"

export async function getDefaultCalendarTemplatesAction() {
  try {
    const templates = await getDefaultCalendarTemplates()
    return { success: true, data: templates }
  } catch (error) {
    console.error("Failed to get default calendar templates:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get default calendar templates",
    }
  }
}