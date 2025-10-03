"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Euro, TrendingUp, Car, Train, Bike, Footprints } from "lucide-react"
import { useCommuteManagement } from "@/server/api-hooks"
import type { TTripAnalytics } from "../server/queries/get-trip-analytics"

type TAnalyticsDashboardProps = {
  startDate?: Date
  endDate?: Date
}

export function TripAnalyticsDashboard({ startDate, endDate }: TAnalyticsDashboardProps) {
  const { getCommuteTripsForPeriod } = useCommuteManagement()
  const [analytics, setAnalytics] = useState<TTripAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [startDate, endDate])

  const loadAnalytics = async () => {
    try {
      if (startDate && endDate) {
        const result = await getCommuteTripsForPeriod(startDate, endDate)
        // Convert the result to match TTripAnalytics format
        const analyticsData: TTripAnalytics = {
          totalTrips: result.summary.tripCount,
          totalDistance: result.summary.totalDistance,
          totalAllowance: result.summary.totalAllowance,
          averageDistance: result.summary.tripCount > 0 ? result.summary.totalDistance / result.summary.tripCount : 0,
          averageAllowance: result.summary.tripCount > 0 ? result.summary.totalAllowance / result.summary.tripCount : 0,
          tripsByMethod: {},
          tripsByMonth: []
        }
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'car': return <Car className="w-4 h-4" />
      case 'public_transport': return <Train className="w-4 h-4" />
      case 'bike': return <Bike className="w-4 h-4" />
      case 'walking': return <Footprints className="w-4 h-4" />
      default: return <Car className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No analytics data available for the selected period.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTrips}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageDistance.toFixed(1)} km average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalDistance.toFixed(1)} km</div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageDistance.toFixed(1)} km per trip
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allowance</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{analytics.totalAllowance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              €{analytics.averageAllowance.toFixed(2)} per trip
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Potential</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{analytics.totalAllowance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Reclaimable from employer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commute Methods Breakdown */}
      {Object.keys(analytics.tripsByMethod).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trips by Commute Method</CardTitle>
            <CardDescription>
              Breakdown of your trips by transportation method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.tripsByMethod).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getMethodIcon(method)}
                    <span className="capitalize">{method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{count} trips</Badge>
                    <span className="text-sm text-muted-foreground">
                      {((count / analytics.totalTrips) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Breakdown */}
      {analytics.tripsByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>
              Your commute activity by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.tripsByMonth.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{month.month}</p>
                    <p className="text-sm text-muted-foreground">
                      {month.distance.toFixed(1)} km • €{month.allowance.toFixed(2)}
                    </p>
                  </div>
                  <Badge variant="outline">{month.trips} trips</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
