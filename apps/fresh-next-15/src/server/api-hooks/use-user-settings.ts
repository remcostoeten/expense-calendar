"use client"

import { useApi } from "@/hooks/use-api"
import { getUserSettingsAction } from "@/features/calendar/server/actions/get-user-settings-action"
import { updateUserSettingsAction } from "@/features/calendar/server/actions/update-user-settings-action"
import type { UserSettingsData } from "@/features/calendar/server/repository/user-settings-repository"

export function useUserSettings() {
  const getUserSettings = useApi({
    action: getUserSettingsAction,
    onError: (error) => console.error("Failed to get user settings:", error),
  })

  const updateUserSettings = useApi({
    action: ({ userId, settings }: { userId: number; settings: UserSettingsData }) =>
      updateUserSettingsAction(userId, settings),
    onError: (error) => console.error("Failed to update user settings:", error),
  })

  return {
    getUserSettings,
    updateUserSettings,
    isLoading: getUserSettings.isPending || updateUserSettings.isPending,
  }
}