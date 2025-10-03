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

export async function calculateDistance(
  homeAddress: string, 
  officeAddress: string
): Promise<TDistanceResult> {
  try {
    // Try Google Maps Distance Matrix API first (most accurate)
    const googleResult = await calculateDistanceWithGoogleMaps(homeAddress, officeAddress)
    if (googleResult.success) {
      return googleResult
    }

    // Fallback to OpenRouteService if Google Maps fails
    const openRouteResult = await calculateDistanceWithOpenRoute(homeAddress, officeAddress)
    if (openRouteResult.success) {
      return openRouteResult
    }

    // Final fallback to straight-line distance
    return await calculateStraightLineDistance(homeAddress, officeAddress)
  } catch (error) {
    console.error("Distance calculation error:", error)
    return {
      success: false,
      error: "Failed to calculate distance. Please try again."
    }
  }
}

async function calculateDistanceWithGoogleMaps(
  homeAddress: string, 
  officeAddress: string
): Promise<TDistanceResult> {
  try {
    const API_KEY = env.GOOGLE_MAPS_API_KEY
    if (!API_KEY) {
      return { success: false, error: "Google Maps API key not configured" }
    }

    const origins = encodeURIComponent(homeAddress)
    const destinations = encodeURIComponent(officeAddress)
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=metric&key=${API_KEY}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google Maps API failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status !== 'OK') {
      return {
        success: false,
        error: `Google Maps API error: ${data.status}`
      }
    }

    const element = data.rows[0]?.elements[0]
    if (!element || element.status !== 'OK') {
      return {
        success: false,
        error: "Could not calculate route between addresses"
      }
    }

    return {
      success: true,
      distance: Math.round(element.distance.value / 1000 * 100) / 100, // Convert meters to km
      duration: Math.round(element.duration.value / 60) // Convert seconds to minutes
    }
  } catch (error) {
    console.error("Google Maps API error:", error)
    return {
      success: false,
      error: "Google Maps API failed"
    }
  }
}

async function calculateDistanceWithOpenRoute(
  homeAddress: string, 
  officeAddress: string
): Promise<TDistanceResult> {
  try {
    // First, geocode the addresses to get coordinates
    const homeCoords = await geocodeAddressWithGoogle(homeAddress)
    const officeCoords = await geocodeAddressWithGoogle(officeAddress)
    
    if (!homeCoords.success || !officeCoords.success) {
      return {
        success: false,
        error: "Could not find one or both addresses. Please check the addresses and try again."
      }
    }

    // Calculate driving distance using OpenRouteService
    const routeResult = await calculateRouteWithOpenRoute(homeCoords.coordinates!, officeCoords.coordinates!)
    
    if (!routeResult.success) {
      return {
        success: false,
        error: "Could not calculate route between addresses."
      }
    }

    return {
      success: true,
      distance: routeResult.distance,
      duration: routeResult.duration
    }
  } catch (error) {
    console.error("OpenRoute calculation error:", error)
    return {
      success: false,
      error: "OpenRoute API failed"
    }
  }
}

async function geocodeAddressWithGoogle(address: string): Promise<{
  success: boolean
  coordinates?: TCoordinates
  error?: string
}> {
  try {
    const API_KEY = env.GOOGLE_MAPS_API_KEY
    if (!API_KEY) {
      // Fallback to Nominatim if no Google API key
      return await geocodeAddressWithNominatim(address)
    }

    const encodedAddress = encodeURIComponent(address)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google Geocoding failed: ${response.status}`)
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
    console.error("Google Geocoding error:", error)
    // Fallback to Nominatim
    return await geocodeAddressWithNominatim(address)
  }
}

async function geocodeAddressWithNominatim(address: string): Promise<{
  success: boolean
  coordinates?: TCoordinates
  error?: string
}> {
  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=nl&limit=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CommuteTracker/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }
    
    const results = await response.json()
    
    if (!results || results.length === 0) {
      return {
        success: false,
        error: "Address not found"
      }
    }
    
    return {
      success: true,
      coordinates: {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon)
      }
    }
  } catch (error) {
    console.error("Nominatim Geocoding error:", error)
    return {
      success: false,
      error: "Failed to geocode address"
    }
  }
}

async function calculateRouteWithOpenRoute(start: TCoordinates, end: TCoordinates): Promise<{
  success: boolean
  distance?: number
  duration?: number
  error?: string
}> {
  try {
    const API_KEY = env.OPENROUTE_API_KEY
    
    if (!API_KEY) {
      // Fallback to simple straight-line distance calculation when no API key
      const distance = calculateStraightLineDistanceBetweenPoints(start, end)
      return {
        success: true,
        distance: Math.round(distance * 1.3), // Add ~30% for road routing
        duration: Math.round(distance * 1.3 / 60 * 60) // Assume 60 km/h average
      }
    }
    
    const url = `https://api.openrouteservice.org/v2/directions/driving-car`
    const body = {
      coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
      format: "json"
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`OpenRoute API failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.routes || data.routes.length === 0) {
      return {
        success: false,
        error: "No route found"
      }
    }
    
    const route = data.routes[0]
    const distanceKm = Math.round(route.summary.distance / 1000 * 100) / 100
    const durationMinutes = Math.round(route.summary.duration / 60)
    
    return {
      success: true,
      distance: distanceKm,
      duration: durationMinutes
    }
  } catch (error) {
    console.error("OpenRoute calculation error:", error)
    // Fallback to straight-line distance
    const distance = calculateStraightLineDistanceBetweenPoints(start, end)
    return {
      success: true,
      distance: Math.round(distance * 1.3),
      duration: Math.round(distance * 1.3 / 60 * 60)
    }
  }
}

async function calculateStraightLineDistance(
  homeAddress: string, 
  officeAddress: string
): Promise<TDistanceResult> {
  try {
    // Geocode both addresses to get coordinates
    const homeCoords = await geocodeAddressWithNominatim(homeAddress)
    const officeCoords = await geocodeAddressWithNominatim(officeAddress)
    
    if (!homeCoords.success || !officeCoords.success) {
      return {
        success: false,
        error: "Could not find one or both addresses for straight-line calculation."
      }
    }

    const distance = calculateStraightLineDistanceBetweenPoints(
      homeCoords.coordinates!, 
      officeCoords.coordinates!
    )
    
    return {
      success: true,
      distance: Math.round(distance * 1.3), // Add ~30% for road routing
      duration: Math.round(distance * 1.3 / 60 * 60) // Assume 60 km/h average
    }
  } catch (error) {
    console.error("Straight-line calculation error:", error)
    return {
      success: false,
      error: "Failed to calculate straight-line distance"
    }
  }
}

function calculateStraightLineDistanceBetweenPoints(point1: TCoordinates, point2: TCoordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLon = (point2.lng - point1.lng) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
