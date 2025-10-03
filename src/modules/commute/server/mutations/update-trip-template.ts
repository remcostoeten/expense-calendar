"use server"

import { db } from "@/server/db"
import { tripTemplates } from "@/server/schema"
import { calculateDistanceAndGeocode } from "../services/google-maps-service"
import { eq } from "drizzle-orm"
import type { NewTripTemplate } from "@/server/schema"

export type TUpdateTripTemplateData = {
  id: number
  userId: string
  name?: string
  description?: string
  fromAddress?: string
  toAddress?: string
  commuteMethod?: 'car' | 'public_transport' | 'walking' | 'bike'
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
  isActive?: boolean
}

export async function updateTripTemplate(data: TUpdateTripTemplateData): Promise<NewTripTemplate> {
  const existingTemplate = await db
    .select()
    .from(tripTemplates)
    .where(eq(tripTemplates.id, data.id))
    .limit(1)
    .then(rows => rows[0])
  
  if (!existingTemplate) {
    throw new Error('Trip template not found')
  }
  
  if (existingTemplate.userId !== data.userId) {
    throw new Error('Unauthorized to update this template')
  }
  
  let routeData = null
  
  if (data.fromAddress && data.toAddress && data.commuteMethod) {
    routeData = await calculateDistanceAndGeocode(
      data.fromAddress,
      data.toAddress,
      data.commuteMethod
    )
  }
  
  const updateData: Partial<NewTripTemplate> = {
    name: data.name || existingTemplate.name,
    description: data.description !== undefined ? data.description : existingTemplate.description,
    fromAddress: data.fromAddress || existingTemplate.fromAddress,
    fromLatitude: routeData?.fromGeocode?.latitude?.toString() || existingTemplate.fromLatitude,
    fromLongitude: routeData?.fromGeocode?.longitude?.toString() || existingTemplate.fromLongitude,
    toAddress: data.toAddress || existingTemplate.toAddress,
    toLatitude: routeData?.toGeocode?.latitude?.toString() || existingTemplate.toLatitude,
    toLongitude: routeData?.toGeocode?.longitude?.toString() || existingTemplate.toLongitude,
    commuteMethod: data.commuteMethod || existingTemplate.commuteMethod,
    distanceKm: routeData?.route?.distanceKm?.toString() || existingTemplate.distanceKm,
    estimatedDurationMinutes: routeData?.route ? Math.round(routeData.route.durationMinutes) : existingTemplate.estimatedDurationMinutes,
    kmAllowance: data.kmAllowance?.toString() || existingTemplate.kmAllowance,
    publicTransportCost: data.publicTransportCost?.toString() || existingTemplate.publicTransportCost,
    homeOfficeAllowance: data.homeOfficeAllowance?.toString() || existingTemplate.homeOfficeAllowance,
    isRecurring: data.isRecurring !== undefined ? data.isRecurring : existingTemplate.isRecurring,
    recurrencePattern: data.recurrencePattern || existingTemplate.recurrencePattern,
    recurrenceDays: data.recurrenceDays || existingTemplate.recurrenceDays,
    recurrenceStartDate: data.recurrenceStartDate || existingTemplate.recurrenceStartDate,
    recurrenceEndDate: data.recurrenceEndDate || existingTemplate.recurrenceEndDate,
    addToCalendar: data.addToCalendar !== undefined ? data.addToCalendar : existingTemplate.addToCalendar,
    calendarId: data.calendarId || existingTemplate.calendarId,
    eventTitle: data.eventTitle || existingTemplate.eventTitle,
    eventDescription: data.eventDescription || existingTemplate.eventDescription,
    isActive: data.isActive !== undefined ? data.isActive : existingTemplate.isActive
  }
  
  const [updatedTemplate] = await db
    .update(tripTemplates)
    .set(updateData)
    .where(eq(tripTemplates.id, data.id))
    .returning()
  
  return updatedTemplate
}
