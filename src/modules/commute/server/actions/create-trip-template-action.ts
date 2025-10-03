"use server"

import { revalidatePath } from "next/cache"
import { createTripTemplate } from "../mutations"
import type { TCreateTripTemplateData } from "../mutations/create-trip-template"
import { getAuthenticatedContext } from "@/server/helpers/auth"

export async function createTripTemplateAction(data: Omit<TCreateTripTemplateData, 'userId'>) {
  try {
    const authResult = await getAuthenticatedContext()
    if (!authResult.ok) {
      return {
        success: false,
        error: "Authentication required"
      }
    }
    
    const userId = authResult.value.stackUserId
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
