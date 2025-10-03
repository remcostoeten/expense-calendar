"use server"

import { db } from "@/server/db"
import { commuteTrips, tripTemplates } from "@/server/schema"
import { eq, and } from "drizzle-orm"
import { createCommuteTrip } from "./create-commute-trip"
import type { TCreateCommuteTripData } from "./create-commute-trip"

export async function createRecurringTripsFromTemplate(
  templateId: number,
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const template = await db
    .select()
    .from(tripTemplates)
    .where(and(eq(tripTemplates.id, templateId), eq(tripTemplates.userId, userId)))
    .limit(1)
    .then(rows => rows[0])
  
  if (!template || !template.isRecurring) {
    throw new Error('Template not found or not configured for recurring trips')
  }
  
  const trips: TCreateCommuteTripData[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    
    let shouldCreateTrip = false
    
    switch (template.recurrencePattern) {
      case 'daily':
        shouldCreateTrip = true
        break
      case 'weekdays':
        shouldCreateTrip = dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday
        break
      case 'weekly':
        shouldCreateTrip = template.recurrenceDays?.includes(dayOfWeek) || false
        break
      case 'custom':
        shouldCreateTrip = template.recurrenceDays?.includes(dayOfWeek) || false
        break
    }
    
    if (shouldCreateTrip) {
      // Check if trip already exists for this date
      const existingTrip = await db
        .select()
        .from(commuteTrips)
        .where(and(
          eq(commuteTrips.templateId, templateId),
          eq(commuteTrips.userId, userId),
          eq(commuteTrips.tripDate, currentDate)
        ))
        .limit(1)
        .then(rows => rows[0])
      
      if (!existingTrip) {
        trips.push({
          userId,
          templateId,
          tripDate: new Date(currentDate),
          fromAddress: template.fromAddress,
          toAddress: template.toAddress,
          commuteMethod: template.commuteMethod as 'car' | 'public_transport' | 'walking' | 'bike',
          kmAllowance: parseFloat(template.kmAllowance || '0.23'),
          publicTransportCost: template.publicTransportCost ? parseFloat(template.publicTransportCost) : undefined,
          homeOfficeAllowance: template.homeOfficeAllowance ? parseFloat(template.homeOfficeAllowance) : undefined,
          isFromHome: true
        })
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  const createdTrips = []
  for (const tripData of trips) {
    const trip = await createCommuteTrip(tripData)
    createdTrips.push(trip)
  }
  
  return createdTrips
}
