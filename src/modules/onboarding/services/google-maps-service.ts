"use server"

import { env } from "@/server/env"

type TDistanceResult = {
  success: boolean
  distance?: number
  duration?: number
  error?: string
}

type TCoordinates = {
  lat: number
  lng: number
}

type TGeocodeResult = {
  success: boolean
  coordinates?: TCoordinates
  error?: string
}

export async function calculateDistance(
  homeAddress: string, 
  officeAddress: string
): Promise<TDistanceResult> {
  try {
    // Geocode both addresses using Google Maps API
    const [homeResult, officeResult] = await Promise.all([
      geocodeAddress(homeAddress),
      geocodeAddress(officeAddress)
    ])
    
    if (!homeResult.success || !officeResult.success) {
      return {
        success: false,
        error: "Could not find one or both addresses. Please check the addresses and try again."
      }
    }

    // Calculate distance and duration using Google Maps Distance Matrix API
    const distanceResult = await calculateRoute(
      homeResult.coordinates!, 
      officeResult.coordinates!
    )
    
    if (!distanceResult.success) {
      return {
        success: false,
        error: "Could not calculate route between addresses."
      }
    }

    return {
      success: true,
      distance: distanceResult.distance,
      duration: distanceResult.duration
    }
  } catch (error) {
    console.error("Distance calculation error:", error)
    return {
      success: false,
      error: "Failed to calculate distance. Please try again."
    }
  }
}

async function geocodeAddress(address: string): Promise<TGeocodeResult> {
  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${env.GOOGLE_MAPS_API_KEY}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return {
        success: false,
        error: "Address not found"
      }
    }
    
    const location = data.results[0].geometry.location
    
    return {
      success: true,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      }
    }
  } catch (error) {
    console.error("Geocoding error:", error)
    return {
      success: false,
      error: "Failed to geocode address"
    }
  }
}

async function calculateRoute(start: TCoordinates, end: TCoordinates): Promise<{
  success: boolean
  distance?: number
  duration?: number
  error?: string
}> {
  try {
    const origins = `${start.lat},${start.lng}`
    const destinations = `${end.lat},${end.lng}`
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=driving&units=metric&key=${env.GOOGLE_MAPS_API_KEY}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Distance Matrix API failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.rows || data.rows.length === 0) {
      return {
        success: false,
        error: "No route found"
      }
    }
    
    const element = data.rows[0].elements[0]
    
    if (element.status !== 'OK') {
      return {
        success: false,
        error: "Route calculation failed"
      }
    }
    
    const distanceKm = Math.round(element.distance.value / 1000 * 100) / 100
    const durationMinutes = Math.round(element.duration.value / 60)
    
    return {
      success: true,
      distance: distanceKm,
      duration: durationMinutes
    }
  } catch (error) {
    console.error("Route calculation error:", error)
    return {
      success: false,
      error: "Failed to calculate route"
    }
  }
}
