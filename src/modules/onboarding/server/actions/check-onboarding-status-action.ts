"use server"

import { getCommuteProfile } from "../queries"

export async function checkOnboardingStatusAction(stackUserId: string) {
  try {
    const profile = await getCommuteProfile(stackUserId)
    
    return {
      success: true,
      isCompleted: profile?.onboardingCompleted || false,
      hasProfile: !!profile
    }
  } catch (error) {
    console.error("Failed to check onboarding status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check onboarding status",
      isCompleted: false,
      hasProfile: false
    }
  }
}
