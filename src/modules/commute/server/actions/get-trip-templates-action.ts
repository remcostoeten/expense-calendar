"use server"

import { getTripTemplates } from "../queries"

export async function getTripTemplatesAction(activeOnly: boolean = true) {
  try {
    // TODO: Get userId from auth context
    const userId = "temp-user-id" // This should come from auth
    
    const templates = await getTripTemplates(userId, activeOnly)
    
    return {
      success: true,
      data: templates
    }
  } catch (error) {
    console.error("Failed to get trip templates:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get trip templates"
    }
  }
}
