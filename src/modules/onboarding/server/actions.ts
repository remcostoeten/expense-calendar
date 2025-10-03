"use server"

import { db } from "@/server/db"
import { commuteProfiles } from "@/server/schema"
import { eq } from "drizzle-orm"
import type { TOnboarding } from "@/app/onboarding/onboarding-flow"

export async function completeOnboardingAction(userId: string, data: TOnboarding) {
  try {
    const existingProfile = await db
      .select()
      .from(commuteProfiles)
      .where(eq(commuteProfiles.userId, userId))
      .limit(1)

    const profileData = {
      userId,
      commuteMethod: data.commuteMethod,
      kmAllowance: String(data.kmAllowance),
      publicTransportCost: data.publicTransportCost ? String(data.publicTransportCost) : null,
      homeOfficeAllowance: String(data.homeOfficeAllowance),
      homeAddress: data.homeAddress,
      homePostalCode: data.homePostalCode,
      homeCity: data.homeCity,
      homeStreet: data.homeStreet,
      officeAddress: data.officeAddress,
      officePostalCode: data.officePostalCode,
      officeCity: data.officeCity,
      officeStreet: data.officeStreet,
      distanceKm: data.distanceKm ? String(data.distanceKm) : null,
      hasFixedOfficeDays: data.hasFixedOfficeDays,
      fixedOfficeDays: data.fixedOfficeDays,
      hasHomeOfficeAllowance: data.hasHomeOfficeAllowance,
      homeOfficeDays: data.homeOfficeDays,
      onboardingCompleted: true,
    }

    if (existingProfile.length > 0) {
      await db
        .update(commuteProfiles)
        .set(profileData)
        .where(eq(commuteProfiles.userId, userId))
    } else {
      await db.insert(commuteProfiles).values(profileData)
    }

    return { success: true }
  } catch (error) {
    console.error("Error completing onboarding:", error)
    return { 
      success: false, 
      error: "Failed to save onboarding data. Please try again." 
    }
  }
}

export async function checkOnboardingStatus(userId: string) {
  try {
    const profile = await db
      .select({ onboardingCompleted: commuteProfiles.onboardingCompleted })
      .from(commuteProfiles)
      .where(eq(commuteProfiles.userId, userId))
      .limit(1)

    return {
      success: true,
      completed: profile.length > 0 ? profile[0].onboardingCompleted : false
    }
  } catch (error) {
    console.error("Error checking onboarding status:", error)
    return { success: false, completed: false }
  }
}
