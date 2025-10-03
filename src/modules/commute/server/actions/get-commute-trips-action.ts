"use server"

import { getCommuteTrips, getCommuteTripsForPeriod } from "../queries"
import { getAuthenticatedContext } from "@/server/helpers/auth"

export async function getCommuteTripsAction(
  startDate?: Date,
  endDate?: Date,
  status?: string
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
    const trips = await getCommuteTrips(userId, startDate, endDate, status)
    
    return {
      success: true,
      data: trips
    }
  } catch (error) {
    console.error("Failed to get commute trips:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get commute trips"
    }
  }
}

export async function getCommuteTripsForPeriodAction(
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
    const trips = await getCommuteTripsForPeriod(userId, startDate, endDate)
    
    const summary = trips.reduce((acc, { trip }) => {
      const distance = parseFloat(trip.distanceKm || '0')
      const allowance = parseFloat(trip.totalAllowance || '0')
      
      return {
        totalDistance: acc.totalDistance + distance,
        totalAllowance: acc.totalAllowance + allowance,
        tripCount: acc.tripCount + 1
      }
    }, {
      totalDistance: 0,
      totalAllowance: 0,
      tripCount: 0
    })
    
    return {
      success: true,
      data: {
        trips,
        summary
      }
    }
  } catch (error) {
    console.error("Failed to get commute trips for period:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get commute trips for period"
    }
  }
}
