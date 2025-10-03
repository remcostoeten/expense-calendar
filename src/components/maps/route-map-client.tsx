"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import * as L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
})

// Custom icons
const homeIcon = L.divIcon({
  html: `<div style="background: #10b981; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏠</div>`,
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const officeIcon = L.divIcon({
  html: `<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🏢</div>`,
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

type TCoordinates = {
  lat: number
  lng: number
}

type TProps = {
  homeAddress: string
  officeAddress: string
  onCalculateRoute?: () => void
}

export default function RouteMapClient({ homeAddress, officeAddress, onCalculateRoute }: TProps) {
  const [homeCoords, setHomeCoords] = useState<TCoordinates | null>(null)
  const [officeCoords, setOfficeCoords] = useState<TCoordinates | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const geocodeAddress = async (address: string): Promise<TCoordinates | null> => {
    try {
      const encodedAddress = encodeURIComponent(address)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      
      const response = await fetch(url)
      
      if (!response.ok) throw new Error("Geocoding failed")
      
      const data = await response.json()
      
      if (data.status !== 'OK' || !data.results || data.results.length === 0) return null
      
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  const calculateRoute = async (start: TCoordinates, end: TCoordinates) => {
    try {
      setIsCalculating(true)
      setError(null)
      
      // Use Google Maps Directions API for real routing
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!API_KEY) {
        throw new Error("Google Maps API key not configured")
      }

      const origin = `${start.lat},${start.lng}`
      const destination = `${end.lat},${end.lng}`
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${API_KEY}&mode=driving&traffic_model=best_guess&departure_time=now`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Directions API failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        throw new Error("No route found")
      }

      const route = data.routes[0]
      const path = route.overview_polyline.points
      
      // Decode the polyline to get coordinates
      const coordinates = decodePolyline(path)
      setRouteCoords(coordinates)
      
      if (onCalculateRoute) {
        onCalculateRoute()
      }
    } catch (error) {
      console.error("Route calculation error:", error)
      setError("Failed to calculate route")
    } finally {
      setIsCalculating(false)
    }
  }

  // Decode Google Maps polyline
  const decodePolyline = (encoded: string): [number, number][] => {
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

  useEffect(() => {
    const loadCoordinates = async () => {
      setIsCalculating(true)
      setError(null)
      
      try {
        const [home, office] = await Promise.all([
          geocodeAddress(homeAddress),
          geocodeAddress(officeAddress)
        ])
        
        if (!home || !office) {
          setError("Could not find one or both addresses")
          return
        }
        
        setHomeCoords(home)
        setOfficeCoords(office)
        
        // Calculate route
        await calculateRoute(home, office)
        
        // Fit map bounds to show both points
        if (mapRef.current) {
          const bounds = L.latLngBounds([
            [home.lat, home.lng],
            [office.lat, office.lng]
          ])
          mapRef.current.fitBounds(bounds, { padding: [20, 20] })
        }
      } catch (error) {
        console.error("Error loading coordinates:", error)
        setError("Failed to load map data")
      } finally {
        setIsCalculating(false)
      }
    }
    
    if (homeAddress && officeAddress) {
      loadCoordinates()
    }
  }, [homeAddress, officeAddress])

  const center: [number, number] = homeCoords 
    ? [homeCoords.lat, homeCoords.lng] 
    : [52.3676, 4.9041] // Amsterdam

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading route...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "400px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {homeCoords && (
          <Marker position={[homeCoords.lat, homeCoords.lng]} icon={homeIcon}>
            <Popup>
              <div className="text-center">
                <div className="font-medium">🏠 Home</div>
                <div className="text-sm text-muted-foreground">{homeAddress}</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {officeCoords && (
          <Marker position={[officeCoords.lat, officeCoords.lng]} icon={officeIcon}>
            <Popup>
              <div className="text-center">
                <div className="font-medium">🏢 Office</div>
                <div className="text-sm text-muted-foreground">{officeAddress}</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {routeCoords.length > 0 && (
          <Polyline 
            positions={routeCoords} 
            pathOptions={{
              color: "#3b82f6",
              weight: 5,
              opacity: 0.9,
              dashArray: "0" // Solid line for real routes
            }}
          />
        )}
      </MapContainer>
      
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-sm">
        <div className="text-xs text-muted-foreground">
          🏠 Home • 🏢 Office
        </div>
      </div>
      
      {isCalculating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Calculating route...</p>
          </div>
        </div>
      )}
    </div>
  )
}
