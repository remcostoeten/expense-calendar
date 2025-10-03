"use server"

import { db } from "@/server/db"
import { commuteTrips } from "@/server/schema"
import { eq, and, between, sql, sum, count } from "drizzle-orm"

export type TTripAnalytics = {
  totalTrips: number
  totalDistance: number
  totalAllowance: number
  averageDistance: number
  averageAllowance: number
  tripsByMethod: Record<string, number>
  tripsByMonth: Array<{
    month: string
    trips: number
    distance: number
    allowance: number
  }>
}

export async function getTripAnalytics(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TTripAnalytics> {
  let baseConditions = and(
    eq(commuteTrips.userId, userId),
    eq(commuteTrips.status, 'completed')
  )
  
  if (startDate && endDate) {
    baseConditions = and(baseConditions, between(commuteTrips.tripDate, startDate, endDate))
  }
  
  // Get basic totals
  const [totals] = await db
    .select({
      totalTrips: count(),
      totalDistance: sum(commuteTrips.distanceKm),
      totalAllowance: sum(commuteTrips.totalAllowance)
    })
    .from(commuteTrips)
    .where(baseConditions)
    .limit(1)
  
  // Get trips by method
  const tripsByMethodResult = await db
    .select({
      commuteMethod: commuteTrips.commuteMethod,
      count: count()
    })
    .from(commuteTrips)
    .where(baseConditions)
    .groupBy(commuteTrips.commuteMethod)
  
  const tripsByMethod = tripsByMethodResult.reduce((acc, row) => {
    acc[row.commuteMethod] = row.count
    return acc
  }, {} as Record<string, number>)
  
  // Get monthly breakdown
  const monthlyData = await db
    .select({
      month: sql<string>`DATE_TRUNC('month', ${commuteTrips.tripDate})`,
      trips: count(),
      distance: sum(commuteTrips.distanceKm),
      allowance: sum(commuteTrips.totalAllowance)
    })
    .from(commuteTrips)
    .where(baseConditions)
    .groupBy(sql`DATE_TRUNC('month', ${commuteTrips.tripDate})`)
    .orderBy(sql`DATE_TRUNC('month', ${commuteTrips.tripDate})`)
  
  const tripsByMonth = monthlyData.map(row => ({
    month: new Date(row.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    trips: row.trips,
    distance: parseFloat(row.distance || '0'),
    allowance: parseFloat(row.allowance || '0')
  }))
  
  const totalTrips = totals.totalTrips || 0
  const totalDistance = parseFloat(totals.totalDistance || '0')
  const totalAllowance = parseFloat(totals.totalAllowance || '0')
  
  return {
    totalTrips,
    totalDistance,
    totalAllowance,
    averageDistance: totalTrips > 0 ? totalDistance / totalTrips : 0,
    averageAllowance: totalTrips > 0 ? totalAllowance / totalTrips : 0,
    tripsByMethod,
    tripsByMonth
  }
}

export async function getTripSummaryForPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const [summary] = await db
    .select({
      totalTrips: count(),
      totalDistance: sum(commuteTrips.distanceKm),
      totalAllowance: sum(commuteTrips.totalAllowance),
      homeToOfficeTrips: sql<number>`COUNT(CASE WHEN ${commuteTrips.isFromHome} = true THEN 1 END)`,
      officeToHomeTrips: sql<number>`COUNT(CASE WHEN ${commuteTrips.isFromHome} = false THEN 1 END)`
    })
    .from(commuteTrips)
    .where(and(
      eq(commuteTrips.userId, userId),
      eq(commuteTrips.status, 'completed'),
      between(commuteTrips.tripDate, startDate, endDate)
    ))
    .limit(1)
  
  return {
    totalTrips: summary.totalTrips || 0,
    totalDistance: parseFloat(summary.totalDistance || '0'),
    totalAllowance: parseFloat(summary.totalAllowance || '0'),
    homeToOfficeTrips: summary.homeToOfficeTrips || 0,
    officeToHomeTrips: summary.officeToHomeTrips || 0,
    roundTrips: Math.min(summary.homeToOfficeTrips || 0, summary.officeToHomeTrips || 0)
  }
}
