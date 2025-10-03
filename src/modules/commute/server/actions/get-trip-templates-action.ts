"use server"

import { getTripTemplates } from "../queries"
import { getAuthenticatedContext } from "@/server/helpers/auth"

export async function getTripTemplatesAction(activeOnly: boolean = true) {
  try {
    const authResult = await getAuthenticatedContext()
    if (!authResult.ok) {
      return {
        success: false,
        error: "Authentication required"
      }
    }
    
    const userId = authResult.value.stackUserId
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
