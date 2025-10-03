"use server"

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
    // For demo purposes, we'll use OpenRouteService (free alternative to Google Maps)
    // In production, you might want to use Google Maps Distance Matrix API
    
    // First, geocode the addresses to get coordinates
    const homeCoords = await geocodeAddress(homeAddress)
    const officeCoords = await geocodeAddress(officeAddress)
    
    if (!homeCoords.success || !officeCoords.success) {
      return {
        success: false,
        error: "Could not find one or both addresses. Please check the addresses and try again."
      }
    }

    // Calculate driving distance using OpenRouteService
    const routeResult = await calculateRoute(homeCoords.coordinates!, officeCoords.coordinates!)
    
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
    console.error("Distance calculation error:", error)
    return {
      success: false,
      error: "Failed to calculate distance. Please try again."
    }
  }
}

async function geocodeAddress(address: string): Promise<{
  success: boolean
  coordinates?: TCoordinates
  error?: string
}> {
  try {
    // Using Nominatim (OpenStreetMap) for geocoding - free alternative
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
    // Using OpenRouteService for routing
    // You'll need to get a free API key from https://openrouteservice.org/
    const API_KEY = process.env.OPENROUTE_API_KEY || 'demo-key'
    
    if (API_KEY === 'demo-key') {
      // Fallback to simple straight-line distance calculation when no API key
      const distance = calculateStraightLineDistance(start, end)
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
      throw new Error(`Routing failed: ${response.status}`)
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
    console.error("Route calculation error:", error)
    // Fallback to straight-line distance
    const distance = calculateStraightLineDistance(start, end)
    return {
      success: true,
      distance: Math.round(distance * 1.3),
      duration: Math.round(distance * 1.3 / 60 * 60)
    }
  }
}

function calculateStraightLineDistance(point1: TCoordinates, point2: TCoordinates): number {
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
