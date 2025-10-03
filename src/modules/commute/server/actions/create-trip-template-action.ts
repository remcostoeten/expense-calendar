"use server"

import { revalidatePath } from "next/cache"
import { createTripTemplate } from "../mutations"
import type { TCreateTripTemplateData } from "../mutations/create-trip-template"

export async function createTripTemplateAction(data: Omit<TCreateTripTemplateData, 'userId'>) {
  try {
    // TODO: Get userId from auth context
    const userId = "temp-user-id" // This should come from auth
    
    const template = await createTripTemplate({
      ...data,
      userId
    })
    
    revalidatePath("/dashboard/trips")
    revalidatePath("/dashboard/calendar")
    
    return {
      success: true,
      data: template
    }
  } catch (error) {
    console.error("Failed to create trip template:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create trip template"
    }
  }
}
