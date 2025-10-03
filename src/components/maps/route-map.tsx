"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const MapWithNoSSR = dynamic(() => import("./route-map-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  )
})

type TProps = {
  homeAddress?: string
  officeAddress?: string
  distance?: number
  duration?: number
  onCalculateRoute?: () => void
}

export default function RouteMap({ 
  homeAddress, 
  officeAddress, 
  distance, 
  duration,
  onCalculateRoute 
}: TProps) {
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    // Only show map when we have both addresses
    if (homeAddress && officeAddress) {
      setShowMap(true)
    }
  }, [homeAddress, officeAddress])

  if (!showMap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🗺️</span>
            Route Preview
          </CardTitle>
          <CardDescription>
            Enter both addresses to see the route on the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
            <p className="text-muted-foreground">Map will appear when addresses are entered</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🗺️</span>
          Route Preview
        </CardTitle>
        <CardDescription>
          Interactive map showing your commute route
          {distance && (
            <span className="block mt-1 text-primary font-medium">
              Distance: {distance} km {duration && `• Duration: ~${Math.round(duration / 60)} hours`}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MapWithNoSSR
          homeAddress={homeAddress!}
          officeAddress={officeAddress!}
          onCalculateRoute={onCalculateRoute}
        />
      </CardContent>
    </Card>
  )
}