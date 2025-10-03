"use server"

import { env } from "@/server/env"

export type TLocation = {
  address: string
  latitude?: number
  longitude?: number
}

export type TRouteResult = {
  distanceKm: number
  durationMinutes: number
  fromLatitude: number
  fromLongitude: number
  toLatitude: number
  toLongitude: number
}

export type TGeocodeResult = {
  latitude: number
  longitude: number
  formattedAddress: string
}

export async function geocodeAddress(address: string): Promise<TGeocodeResult | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${env.GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results?.[0]) {
      console.error('Geocoding failed:', data.status, data.error_message)
      return null
    }
    
    const result = data.results[0]
    const location = result.geometry.location
    
    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function calculateRoute(
  from: TLocation,
  to: TLocation,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<TRouteResult | null> {
  try {
    const fromStr = from.latitude && from.longitude 
      ? `${from.latitude},${from.longitude}`
      : encodeURIComponent(from.address)
      
    const toStr = to.latitude && to.longitude 
      ? `${to.latitude},${to.longitude}`
      : encodeURIComponent(to.address)
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${fromStr}&destinations=${toStr}&mode=${mode}&units=metric&key=${env.GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      console.error('Distance calculation failed:', data.status, data.error_message)
      return null
    }
    
    const element = data.rows[0].elements[0]
    
    if (element.status !== 'OK') {
      console.error('Route calculation failed:', element.status)
      return null
    }
    
    return {
      distanceKm: element.distance.value / 1000, // Convert meters to km
      durationMinutes: element.duration.value / 60, // Convert seconds to minutes
      fromLatitude: data.origin_addresses[0] ? parseFloat(data.origin_addresses[0].split(',')[0]) : 0,
      fromLongitude: data.origin_addresses[0] ? parseFloat(data.origin_addresses[0].split(',')[1]) : 0,
      toLatitude: data.destination_addresses[0] ? parseFloat(data.destination_addresses[0].split(',')[0]) : 0,
      toLongitude: data.destination_addresses[0] ? parseFloat(data.destination_addresses[0].split(',')[1]) : 0
    }
  } catch (error) {
    console.error('Route calculation error:', error)
    return null
  }
}

export async function calculateDistanceAndGeocode(
  fromAddress: string,
  toAddress: string,
  commuteMethod: 'car' | 'public_transport' | 'walking' | 'bike'
): Promise<{
  route?: TRouteResult
  fromGeocode?: TGeocodeResult
  toGeocode?: TGeocodeResult
} | null> {
  try {
    const modeMap = {
      car: 'driving' as const,
      public_transport: 'transit' as const,
      walking: 'walking' as const,
      bike: 'bicycling' as const
    }
    
    const mode = modeMap[commuteMethod]
    
    const [routeResult, fromGeocode, toGeocode] = await Promise.all([
      calculateRoute(
        { address: fromAddress },
        { address: toAddress },
        mode
      ),
      geocodeAddress(fromAddress),
      geocodeAddress(toAddress)
    ])
    
    return {
      route: routeResult || undefined,
      fromGeocode: fromGeocode || undefined,
      toGeocode: toGeocode || undefined
    }
  } catch (error) {
    console.error('Distance and geocoding error:', error)
    return null
  }
}
