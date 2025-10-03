"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { calculateDistance } from "@/modules/onboarding/services/distance-service"
import RouteMap from "@/components/maps/route-map"
import type { TOnboarding } from "../onboarding-flow"

type TProps = {
  data: TOnboarding
  updateData: (updates: Partial<TOnboarding>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => void
}

export function AddressesStep({
  data,
  updateData,
  nextStep
}: TProps) {
  const [homeAddress, setHomeAddress] = useState({
    street: data.homeStreet || '',
    postalCode: data.homePostalCode || '',
    city: data.homeCity || ''
  })

  const [officeAddress, setOfficeAddress] = useState({
    street: data.officeStreet || '',
    postalCode: data.officePostalCode || '',
    city: data.officeCity || ''
  })

  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | undefined>()

  const updateHomeAddress = (field: keyof typeof homeAddress, value: string) => {
    const newAddress = { ...homeAddress, [field]: value }
    setHomeAddress(newAddress)
    
    const fullAddress = `${newAddress.street}, ${newAddress.postalCode} ${newAddress.city}, Netherlands`
    updateData({
      homeStreet: newAddress.street,
      homePostalCode: newAddress.postalCode,
      homeCity: newAddress.city,
      homeAddress: fullAddress
    })
  }

  const updateOfficeAddress = (field: keyof typeof officeAddress, value: string) => {
    const newAddress = { ...officeAddress, [field]: value }
    setOfficeAddress(newAddress)
    
    const fullAddress = `${newAddress.street}, ${newAddress.postalCode} ${newAddress.city}, Netherlands`
    updateData({
      officeStreet: newAddress.street,
      officePostalCode: newAddress.postalCode,
      officeCity: newAddress.city,
      officeAddress: fullAddress
    })
  }

  const handleCalculateDistance = async () => {
    if (!data.homeAddress || !data.officeAddress) return
    
    setIsCalculatingDistance(true)
    setCalculationError(null)
    
    try {
      const result = await calculateDistance(data.homeAddress, data.officeAddress)
      
      if (result.success) {
        updateData({ 
          distanceKm: result.distance 
        })
        setDuration(result.duration)
      } else {
        setCalculationError(result.error || "Failed to calculate distance")
      }
    } catch (error) {
      console.error("Distance calculation error:", error)
      setCalculationError("An unexpected error occurred")
    } finally {
      setIsCalculatingDistance(false)
    }
  }

  const isFormValid = homeAddress.street && homeAddress.postalCode && homeAddress.city &&
                     officeAddress.street && officeAddress.postalCode && officeAddress.city

  // Auto-calculate distance when both addresses are complete
  useEffect(() => {
    if (isFormValid && !data.distanceKm && !isCalculatingDistance) {
      const debounceTimer = setTimeout(() => {
        handleCalculateDistance()
      }, 1000) // Wait 1 second after user stops typing
      
      return () => clearTimeout(debounceTimer)
    }
  }, [data.homeAddress, data.officeAddress, isFormValid])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Addresses</h2>
        <p className="text-muted-foreground">
          Enter your home and office addresses to automatically calculate commuting distance
        </p>
      </div>

      <div className="grid gap-6">
        {/* Home Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🏠</span>
              Home Address
            </CardTitle>
            <CardDescription>
              Your residential address in the Netherlands
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="home-street">Street Address</Label>
                <Input
                  id="home-street"
                  value={homeAddress.street}
                  onChange={(e) => updateHomeAddress('street', e.target.value)}
                  placeholder="e.g., Hoofdstraat 123"
                />
              </div>
              <div>
                <Label htmlFor="home-postal">Postal Code</Label>
                <Input
                  id="home-postal"
                  value={homeAddress.postalCode}
                  onChange={(e) => updateHomeAddress('postalCode', e.target.value.toUpperCase())}
                  placeholder="e.g., 1234 AB"
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="home-city">City</Label>
              <Input
                id="home-city"
                value={homeAddress.city}
                onChange={(e) => updateHomeAddress('city', e.target.value)}
                placeholder="e.g., Amsterdam"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Office Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🏢</span>
              Office Address
            </CardTitle>
            <CardDescription>
              Your workplace address in the Netherlands
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="office-street">Street Address</Label>
                <Input
                  id="office-street"
                  value={officeAddress.street}
                  onChange={(e) => updateOfficeAddress('street', e.target.value)}
                  placeholder="e.g., Business Park 456"
                />
              </div>
              <div>
                <Label htmlFor="office-postal">Postal Code</Label>
                <Input
                  id="office-postal"
                  value={officeAddress.postalCode}
                  onChange={(e) => updateOfficeAddress('postalCode', e.target.value.toUpperCase())}
                  placeholder="e.g., 5678 CD"
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="office-city">City</Label>
              <Input
                id="office-city"
                value={officeAddress.city}
                onChange={(e) => updateOfficeAddress('city', e.target.value)}
                placeholder="e.g., Rotterdam"
              />
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map and Distance */}
        {isFormValid && (
          <>
            <RouteMap
              homeAddress={data.homeAddress}
              officeAddress={data.officeAddress}
              distance={data.distanceKm}
              duration={duration}
              onCalculateRoute={handleCalculateDistance}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>📏</span>
                  Distance & Duration
                </CardTitle>
                <CardDescription>
                  Automatically calculated commute information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    {isCalculatingDistance ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-muted-foreground">Calculating distance...</span>
                      </div>
                    ) : data.distanceKm ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-lg font-semibold">
                            {data.distanceKm} km
                          </Badge>
                          {duration && (
                            <Badge variant="outline">
                              ~{Math.round(duration / 60)} hours
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Estimated commute distance via car route
                        </p>
                      </div>
                    ) : calculationError ? (
                      <div className="space-y-1">
                        <p className="text-sm text-destructive">{calculationError}</p>
                        <Button 
                          onClick={handleCalculateDistance} 
                          variant="outline" 
                          size="sm"
                          disabled={isCalculatingDistance}
                        >
                          Retry Calculation
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Distance will be calculated automatically
                      </p>
                    )}
                  </div>
                  
                  {!isCalculatingDistance && !data.distanceKm && !calculationError && (
                    <Button onClick={handleCalculateDistance} variant="outline">
                      Calculate Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="pt-4">
        <Button 
          onClick={nextStep} 
          className="w-full"
          disabled={!isFormValid || (!data.distanceKm && !calculationError)}
        >
          Continue
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {calculationError 
            ? "You can continue even if distance calculation failed - you can update it later"
            : "Distance calculation is required to continue"
          }
        </p>
      </div>
    </div>
  )
}