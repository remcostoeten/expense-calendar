"use server"

import { getUserSettings } from "../queries/get-user-settings"

export async function getUserSettingsAction(userId: number) {
  try {
    const settings = await getUserSettings(userId)
    
    return {
      success: true,
      data: settings || {
        showCurrentTime: true,
        showRecurringEvents: true,
        defaultView: "week",
      },
    }
  } catch (error) {
    console.error("Failed to get user settings:", error)
    return {
      success: false,
      error: "Failed to get user settings",
    }
  }
}