"use server"

import { upsertUserSettings, type UserSettingsData } from "../mutations/upsert-user-settings"

export async function updateUserSettingsAction(userId: number, settings: UserSettingsData) {
  try {
    const updatedSettings = await upsertUserSettings(userId, settings)
    
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