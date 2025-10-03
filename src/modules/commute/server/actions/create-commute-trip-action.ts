"use server"

import { revalidatePath } from "next/cache"
import { createCommuteTrip } from "../mutations"
import type { TCreateCommuteTripData } from "../mutations/create-commute-trip"
import { getAuthenticatedContext } from "@/server/helpers/auth"

export async function createCommuteTripAction(data: Omit<TCreateCommuteTripData, 'userId'>) {
  try {
    const authResult = await getAuthenticatedContext()
    if (!authResult.ok) {
      return {
        success: false,
        error: "Authentication required"
      }
    }
    
    const userId = authResult.value.stackUserId
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
