"use server"

import { db } from "@/server/db"
import { commuteTrips, tripTemplates } from "@/server/schema"
import { eq, and, desc, gte, lte, between } from "drizzle-orm"

export async function getCommuteTrips(
  userId: string, 
  startDate?: Date, 
  endDate?: Date,
  status?: string
) {
  let conditions = eq(commuteTrips.userId, userId)
  
  if (startDate && endDate) {
    conditions = and(conditions, between(commuteTrips.tripDate, startDate, endDate))
  } else if (startDate) {
    conditions = and(conditions, gte(commuteTrips.tripDate, startDate))
  } else if (endDate) {
    conditions = and(conditions, lte(commuteTrips.tripDate, endDate))
  }
  
  if (status) {
    conditions = and(conditions, eq(commuteTrips.status, status))
  }
  
  return await db
    .select({
      trip: commuteTrips,
      template: tripTemplates
    })
    .from(commuteTrips)
    .leftJoin(tripTemplates, eq(commuteTrips.templateId, tripTemplates.id))
    .where(conditions)
    .orderBy(desc(commuteTrips.tripDate))
}

export async function getCommuteTrip(tripId: number, userId: string) {
  const [result] = await db
    .select({
      trip: commuteTrips,
      template: tripTemplates
    })
    .from(commuteTrips)
    .leftJoin(tripTemplates, eq(commuteTrips.templateId, tripTemplates.id))
    .where(and(eq(commuteTrips.id, tripId), eq(commuteTrips.userId, userId)))
    .limit(1)
    
  return result || null
}

export async function getCommuteTripsByTemplate(templateId: number, userId: string) {
  return await db
    .select()
    .from(commuteTrips)
    .where(and(eq(commuteTrips.templateId, templateId), eq(commuteTrips.userId, userId)))
    .orderBy(desc(commuteTrips.tripDate))
}

export async function getCommuteTripsForPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return await db
    .select({
      trip: commuteTrips,
      template: tripTemplates
    })
    .from(commuteTrips)
    .leftJoin(tripTemplates, eq(commuteTrips.templateId, tripTemplates.id))
    .where(and(
      eq(commuteTrips.userId, userId),
      eq(commuteTrips.status, 'completed'),
      between(commuteTrips.tripDate, startDate, endDate)
    ))
    .orderBy(commuteTrips.tripDate)
}
