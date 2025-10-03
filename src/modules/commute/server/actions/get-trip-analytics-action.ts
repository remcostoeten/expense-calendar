"use server"

import { getTripAnalytics, getTripSummaryForPeriod } from "../queries"
import { getAuthenticatedContext } from "@/server/helpers/auth"

export async function getTripAnalyticsAction(
  startDate?: Date,
  endDate?: Date
) {
  try {
    const authResult = await getAuthenticatedContext()
    if (!authResult.ok) {
      return {
        success: false,
        error: "Authentication required"
      }
    }
    
    const userId = authResult.value.stackUserId
    const analytics = await getTripAnalytics(userId, startDate, endDate)
    
    return {
      success: true,
      data: analytics
    }
  } catch (error) {
    console.error("Failed to get trip analytics:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get trip analytics"
    }
  }
}

export async function getTripSummaryForPeriodAction(
  startDate: Date,
  endDate: Date
) {
  try {
    const authResult = await getAuthenticatedContext()
    if (!authResult.ok) {
      return {
        success: false,
        error: "Authentication required"
      }
    }
    
    const userId = authResult.value.stackUserId
    const summary = await getTripSummaryForPeriod(userId, startDate, endDate)
    
    return {
      success: true,
      data: summary
    }
  } catch (error) {
    console.error("Failed to get trip summary for period:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get trip summary for period"
    }
  }
}
