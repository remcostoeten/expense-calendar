"use server"

import { UserSettingsRepository } from "../repository/user-settings-repository"

export async function getUserSettingsAction(userId: number) {
  try {
    const repository = new UserSettingsRepository()
    const settings = await repository.getUserSettings(userId)
    
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