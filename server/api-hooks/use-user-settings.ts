"use client"

import { useState } from "react"
import { getUserSettingsAction } from "@/features/calendar/server/actions/get-user-settings-action"
import { updateUserSettingsAction } from "@/features/calendar/server/actions/update-user-settings-action"
import type { UserSettingsData } from "@/features/calendar/server/repository/user-settings-repository"

export function useUserSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const getUserSettings = {
    execute: async (userId: number) => {
      setIsLoading(true)
      try {
        const result = await getUserSettingsAction(userId)
        return result
      } finally {
        setIsLoading(false)
      }
    },
  }

  const updateUserSettings = {
    execute: async (userId: number, settings: UserSettingsData) => {
      setIsLoading(true)
      try {
        const result = await updateUserSettingsAction(userId, settings)
        return result
      } finally {
        setIsLoading(false)
      }
    },
  }

  return {
    getUserSettings,
    updateUserSettings,
    isLoading,
  }
}