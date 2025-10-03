"use server"

import { revalidatePath } from "next/cache"
import { createCommuteTrip } from "../mutations"
import type { TCreateCommuteTripData } from "../mutations/create-commute-trip"

export async function createCommuteTripAction(data: Omit<TCreateCommuteTripData, 'userId'>) {
  try {
    // TODO: Get userId from auth context
    const userId = "temp-user-id" // This should come from auth
    
    const trip = await createCommuteTrip({
      ...data,
      userId
    })
    
    revalidatePath("/dashboard/trips")
    revalidatePath("/dashboard/calendar")
    
    return {
      success: true,
      data: trip
    }
  } catch (error) {
    console.error("Failed to create commute trip:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create commute trip"
    }
  }
}
