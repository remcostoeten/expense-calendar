"use server"

import { env } from "@/server/env"

type TRouteData = {
  success: boolean
  route?: {
    coordinates: [number, number][]
    distance: number
    duration: number
    durationInTraffic?: number
    summary: string
  }
  error?: string
}

export async function getRouteVisualization(
  homeAddress: string,
  officeAddress: string
): Promise<TRouteData> {
  try {
    const API_KEY = env.GOOGLE_MAPS_API_KEY
    if (!API_KEY) {
      return {
        success: false,
        error: "Google Maps API key not configured"
      }
    }

    const origin = encodeURIComponent(homeAddress)
    const destination = encodeURIComponent(officeAddress)
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${API_KEY}&mode=driving&traffic_model=best_guess&departure_time=now&alternatives=true`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Directions API failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      return {
        success: false,
        error: "No route found"
      }
    }

    const route = data.routes[0]
    const coordinates = decodePolyline(route.overview_polyline.points)
    
    return {
      success: true,
      route: {
        coordinates,
        distance: route.legs[0].distance.value / 1000, // Convert to km
        duration: route.legs[0].duration.value / 60, // Convert to minutes
        durationInTraffic: route.legs[0].duration_in_traffic?.value / 60, // Convert to minutes
        summary: route.summary
      }
    }
  } catch (error) {
    console.error("Route visualization error:", error)
    return {
      success: false,
      error: "Failed to get route visualization"
    }
  }
}

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b: number
    let shift = 0
    let result = 0
    
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lat += dlat

    shift = 0
    result = 0
    
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lng += dlng

    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}
