"use server"

import { getTripAnalytics, getTripSummaryForPeriod } from "../queries"

export async function getTripAnalyticsAction(
  startDate?: Date,
  endDate?: Date
) {
  try {
    // TODO: Get userId from auth context
    const userId = "temp-user-id" // This should come from auth
    
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
    // TODO: Get userId from auth context
    const userId = "temp-user-id" // This should come from auth
    
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
