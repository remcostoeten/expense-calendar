"use server"

import { db } from "@/server/db"
import { tripTemplates } from "@/server/schema"
import { calculateDistanceAndGeocode } from "../services/google-maps-service"
import type { NewTripTemplate } from "@/server/schema"

export type TCreateTripTemplateData = {
  userId: string
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
}

export async function createTripTemplate(data: TCreateTripTemplateData): Promise<NewTripTemplate> {
  const routeData = await calculateDistanceAndGeocode(
    data.fromAddress,
    data.toAddress,
    data.commuteMethod
  )
  
  if (!routeData?.route) {
    throw new Error('Failed to calculate route distance and duration')
  }
  
  const templateData: NewTripTemplate = {
    userId: data.userId,
    name: data.name,
    description: data.description || null,
    fromAddress: data.fromAddress,
    fromLatitude: routeData.fromGeocode?.latitude?.toString() || null,
    fromLongitude: routeData.fromGeocode?.longitude?.toString() || null,
    toAddress: data.toAddress,
    toLatitude: routeData.toGeocode?.latitude?.toString() || null,
    toLongitude: routeData.toGeocode?.longitude?.toString() || null,
    commuteMethod: data.commuteMethod,
    distanceKm: routeData.route.distanceKm.toString(),
    estimatedDurationMinutes: Math.round(routeData.route.durationMinutes),
    kmAllowance: data.kmAllowance?.toString() || '0.23',
    publicTransportCost: data.publicTransportCost?.toString() || null,
    homeOfficeAllowance: data.homeOfficeAllowance?.toString() || null,
    isRecurring: data.isRecurring || false,
    recurrencePattern: data.recurrencePattern || null,
    recurrenceDays: data.recurrenceDays || null,
    recurrenceStartDate: data.recurrenceStartDate || null,
    recurrenceEndDate: data.recurrenceEndDate || null,
    addToCalendar: data.addToCalendar || false,
    calendarId: data.calendarId || null,
    eventTitle: data.eventTitle || null,
    eventDescription: data.eventDescription || null,
    isActive: true
  }
  
  const [newTemplate] = await db
    .insert(tripTemplates)
    .values(templateData)
    .returning()
  
  return newTemplate
}
