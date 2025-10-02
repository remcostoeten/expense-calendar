"use server"

import { UserSettingsRepository, type UserSettingsData } from "../repository/user-settings-repository"

export async function updateUserSettingsAction(userId: number, settings: UserSettingsData) {
  try {
    const repository = new UserSettingsRepository()
    const updatedSettings = await repository.upsertUserSettings(userId, settings)
    
    return {
      success: true,
      data: updatedSettings,
    }
  } catch (error) {
    console.error("Failed to update user settings:", error)
    return {
      success: false,
      error: "Failed to update user settings",
    }
  }
}