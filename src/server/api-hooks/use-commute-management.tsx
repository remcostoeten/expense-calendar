"use client"

import { useState, useCallback } from "react"
import { createTripTemplateAction } from "@/modules/commute/server/actions/create-trip-template-action"
import { createCommuteTripAction } from "@/modules/commute/server/actions/create-commute-trip-action"
import { getTripTemplatesAction } from "@/modules/commute/server/actions/get-trip-templates-action"
import { getCommuteTripsAction, getCommuteTripsForPeriodAction } from "@/modules/commute/server/actions/get-commute-trips-action"
import type { TTripTemplate, TCommuteTrip } from "@/server/schema"

export function useCommuteManagement() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTripTemplate = useCallback(async (data: {
    name: string
    description?: string
    fromAddress: string
    toAddress: string
    commuteMethod: 'car' | 'public_transport' | 'walking' | 'bike'
    kmAllowance?: number
    publicTransportCost?: number
    homeOfficeAllowance?: number
    isRecurring?: boolean
    recurrencePattern?: 'daily' | 'weekly' | 'weekdays' | 'custom'
    recurrenceDays?: number[]
    recurrenceStartDate?: Date
    recurrenceEndDate?: Date
    addToCalendar?: boolean
    calendarId?: number
    eventTitle?: string
    eventDescription?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await createTripTemplateAction(data)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trip template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCommuteTrip = useCallback(async (data: {
    templateId?: number
    tripDate: Date
    departureTime?: Date
    arrivalTime?: Date
    fromAddress?: string
    toAddress?: string
    commuteMethod?: 'car' | 'public_transport' | 'walking' | 'bike'
    kmAllowance?: number
    publicTransportCost?: number
    homeOfficeAllowance?: number
    isFromHome?: boolean
    notes?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await createCommuteTripAction(data)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create commute trip'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTripTemplates = useCallback(async (activeOnly: boolean = true) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getTripTemplatesAction(activeOnly)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get trip templates'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCommuteTrips = useCallback(async (
    startDate?: Date,
    endDate?: Date,
    status?: string
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getCommuteTripsAction(startDate, endDate, status)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get commute trips'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCommuteTripsForPeriod = useCallback(async (
    startDate: Date,
    endDate: Date
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getCommuteTripsForPeriodAction(startDate, endDate)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get commute trips for period'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    createTripTemplate,
    createCommuteTrip,
    getTripTemplates,
    getCommuteTrips,
    getCommuteTripsForPeriod
  }
}
