"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Clock, Euro, Plus, Route, BarChart3 } from "lucide-react"
import { TripTemplateForm } from "@/modules/commute/components/trip-template-form"
import { TripAnalyticsDashboard } from "@/modules/commute/components/trip-analytics-dashboard"
import { useCommuteManagement } from "@/server/api-hooks"
import type { TTripTemplate, TCommuteTrip } from "@/server/schema"

export function TripsDashboard() {
  const { getTripTemplates, getCommuteTrips, isLoading } = useCommuteManagement()
  const [templates, setTemplates] = useState<TTripTemplate[]>([])
  const [recentTrips, setRecentTrips] = useState<Array<{ trip: TCommuteTrip; template?: TTripTemplate }>>([])
  const [showTemplateForm, setShowTemplateForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [templatesData, tripsData] = await Promise.all([
        getTripTemplates(true),
        getCommuteTrips(undefined, undefined, 'completed')
      ])
      
      setTemplates(templatesData)
      setRecentTrips(tripsData.slice(0, 5)) // Show last 5 trips
    } catch (error) {
      console.error('Failed to load trips data:', error)
    }
  }

  const handleTemplateCreated = () => {
    setShowTemplateForm(false)
    loadData() // Reload data
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Commute Trips</h1>
          <p className="text-muted-foreground">
            Manage your commute templates and track your trips
          </p>
        </div>
        <Button onClick={() => setShowTemplateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {showTemplateForm && (
        <TripTemplateForm
          onSuccess={handleTemplateCreated}
          onCancel={() => setShowTemplateForm(false)}
        />
      )}

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center">
            <Route className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trip Templates */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Route className="w-5 h-5 mr-2" />
                    Trip Templates
                  </CardTitle>
                  <CardDescription>
                    Your saved commute routes and templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No templates yet. Create your first commute template to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <Card key={template.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold">{template.name}</h3>
                                {template.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {template.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {template.fromAddress} → {template.toAddress}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {template.estimatedDurationMinutes}m
                                  </div>
                                  <div className="flex items-center">
                                    <Euro className="w-4 h-4 mr-1" />
                                    {template.distanceKm} km
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge variant={template.isRecurring ? "default" : "secondary"}>
                                  {template.commuteMethod}
                                </Badge>
                                {template.isRecurring && (
                                  <Badge variant="outline">
                                    {template.recurrencePattern}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Trips */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Recent Trips
                  </CardTitle>
                  <CardDescription>
                    Your latest commute trips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading trips...</div>
                  ) : recentTrips.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No trips recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTrips.map(({ trip, template }) => (
                        <div key={trip.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {new Date(trip.tripDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {trip.isFromHome ? 'Home → Office' : 'Office → Home'}
                              </p>
                              <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                                <span>{trip.distanceKm} km</span>
                                <span>•</span>
                                <span>€{trip.totalAllowance}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {trip.commuteMethod}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <TripAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}