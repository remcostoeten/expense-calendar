"use server"

import { db } from "@/server/db"
import { commuteProfiles } from "@/server/schema"
import type { OnboardingData } from "@/app/onboarding/onboarding-flow"

type TCommuteProfile = typeof commuteProfiles.$inferInsert

export async function createCommuteProfile(
  userId: string,
  onboardingData: OnboardingData
): Promise<TCommuteProfile> {
  const profileData: TCommuteProfile = {
    userId,
    commuteMethod: onboardingData.commuteMethod,
    kmAllowance: onboardingData.kmAllowance.toString(),
    publicTransportCost: onboardingData.publicTransportCost?.toString() || null,
    homeOfficeAllowance: onboardingData.homeOfficeAllowance.toString(),
    homeAddress: onboardingData.homeAddress,
    homePostalCode: onboardingData.homePostalCode,
    homeCity: onboardingData.homeCity,
    homeStreet: onboardingData.homeStreet,
    officeAddress: onboardingData.officeAddress,
    officePostalCode: onboardingData.officePostalCode,
    officeCity: onboardingData.officeCity,
    officeStreet: onboardingData.officeStreet,
    distanceKm: onboardingData.distanceKm?.toString() || null,
    hasFixedOfficeDays: onboardingData.hasFixedOfficeDays,
    fixedOfficeDays: onboardingData.fixedOfficeDays,
    hasHomeOfficeAllowance: onboardingData.hasHomeOfficeAllowance,
    homeOfficeDays: onboardingData.homeOfficeDays,
    onboardingCompleted: true,
  }

  const [newProfile] = await db
    .insert(commuteProfiles)
    .values(profileData)
    .returning()

  return newProfile
}
