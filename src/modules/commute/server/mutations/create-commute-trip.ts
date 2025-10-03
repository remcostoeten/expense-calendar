"use server"

import { db } from "@/server/db"
import { commuteTrips } from "@/server/schema"
import { calculateDistanceAndGeocode } from "../services/google-maps-service"
import type { NewCommuteTrip } from "@/server/schema"

export type TCreateCommuteTripData = {
  userId: string
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
}

export async function createCommuteTrip(data: TCreateCommuteTripData): Promise<NewCommuteTrip> {
  let tripData: Partial<NewCommuteTrip> = {
    userId: data.userId,
    templateId: data.templateId || null,
    tripDate: data.tripDate,
    departureTime: data.departureTime || null,
    arrivalTime: data.arrivalTime || null,
    commuteMethod: data.commuteMethod || 'car',
    kmAllowance: data.kmAllowance?.toString() || '0.23',
    publicTransportCost: data.publicTransportCost?.toString() || null,
    homeOfficeAllowance: data.homeOfficeAllowance?.toString() || null,
    isFromHome: data.isFromHome !== undefined ? data.isFromHome : true,
    notes: data.notes || null,
    status: 'completed',
    totalAllowance: '0.00' // Will be calculated below
  }
  
  if (data.fromAddress && data.toAddress && data.commuteMethod) {
    const routeData = await calculateDistanceAndGeocode(
      data.fromAddress,
      data.toAddress,
      data.commuteMethod
    )
    
    if (routeData?.route) {
      tripData = {
        ...tripData,
        fromAddress: data.fromAddress,
        fromLatitude: routeData.fromGeocode?.latitude?.toString() || null,
        fromLongitude: routeData.fromGeocode?.longitude?.toString() || null,
        toAddress: data.toAddress,
        toLatitude: routeData.toGeocode?.latitude?.toString() || null,
        toLongitude: routeData.toGeocode?.longitude?.toString() || null,
        distanceKm: routeData.route.distanceKm.toString(),
        actualDurationMinutes: Math.round(routeData.route.durationMinutes)
      }
    }
  }
  
  const kmAllowance = parseFloat(tripData.kmAllowance || '0.23')
  const distanceKm = parseFloat(tripData.distanceKm || '0')
  const kmAmount = kmAllowance * distanceKm
  
  const publicTransportCost = parseFloat(tripData.publicTransportCost || '0')
  const homeOfficeAllowance = parseFloat(tripData.homeOfficeAllowance || '0')
  
  tripData.totalAllowance = (kmAmount + publicTransportCost + homeOfficeAllowance).toString()
  
  const [newTrip] = await db
    .insert(commuteTrips)
    .values(tripData as NewCommuteTrip)
    .returning()
  
  return newTrip
}
