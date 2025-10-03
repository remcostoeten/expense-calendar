"use server"

import { revalidatePath } from "next/cache"
import { createCommuteProfile } from "../mutations"
import type { TOnboarding } from "@/app/onboarding/onboarding-flow"

export async function completeOnboardingAction(
    stackUserId: string,
    onboardingData: TOnboarding
) {
    try {
        await createCommuteProfile(stackUserId, onboardingData)

        revalidatePath("/dashboard")
        revalidatePath("/onboarding")

        return {
            success: true,
            message: "Onboarding completed successfully"
        }
    } catch (error) {
        console.error("Failed to complete onboarding:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to complete onboarding"
        }
    }
}
