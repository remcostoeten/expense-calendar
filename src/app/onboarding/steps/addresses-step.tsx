"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { calculateDistance } from "@/modules/onboarding/services/google-maps-service"
import RouteMap from "@/components/maps/route-map"
import type { TStepProps, TAddress } from "@/modules/onboarding/types"

function buildFullAddress(address: TAddress): string {
  return `${address.street}, ${address.postalCode} ${address.city}, Netherlands`
}

export function AddressesStep({ data, updateData, nextStep }: TStepProps) {
  const [homeAddress, setHomeAddress] = useState<TAddress>({
    street: data.homeStreet || '',
    postalCode: data.homePostalCode || '',
    city: data.homeCity || ''
  })

  const [officeAddress, setOfficeAddress] = useState<TAddress>({
    street: data.officeStreet || '',
    postalCode: data.officePostalCode || '',
    city: data.officeCity || ''
  })

  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | undefined>()

  const updateHomeAddress = useCallback(function(field: keyof TAddress, value: string) {
    setHomeAddress(prev => {
      const newAddress = { ...prev, [field]: value }
      const fullAddress = buildFullAddress(newAddress)
      updateData({
        homeStreet: newAddress.street,
        homePostalCode: newAddress.postalCode,
        homeCity: newAddress.city,
        homeAddress: fullAddress
      })
      return newAddress
    })
  }, [updateData])

  const updateOfficeAddress = useCallback(function(field: keyof TAddress, value: string) {
    setOfficeAddress(prev => {
      const newAddress = { ...prev, [field]: value }
      const fullAddress = buildFullAddress(newAddress)
      updateData({
        officeStreet: newAddress.street,
        officePostalCode: newAddress.postalCode,
        officeCity: newAddress.city,
        officeAddress: fullAddress
      })
      return newAddress
    })
  }, [updateData])

  const handleCalculateDistance = useCallback(async function() {
    if (!data.homeAddress || !data.officeAddress) return
    
    setIsCalculatingDistance(true)
    setCalculationError(null)
    
    try {
      const result = await calculateDistance(data.homeAddress, data.officeAddress)
      
      if (result.success) {
        updateData({ distanceKm: result.distance })
        setDuration(result.duration)
        toast.success(`Distance calculated: ${result.distance} km`)
      } else {
        const error = result.error || "Failed to calculate distance"
        setCalculationError(error)
        toast.error(error)
      }
    } catch (error) {
      console.error("Distance calculation error:", error)
      const errorMessage = "An unexpected error occurred"
      setCalculationError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsCalculatingDistance(false)
    }
  }, [data.homeAddress, data.officeAddress, updateData])

  const isFormValid = useMemo(function() {
    return Boolean(
      homeAddress.street && homeAddress.postalCode && homeAddress.city &&
      officeAddress.street && officeAddress.postalCode && officeAddress.city
    )
  }, [homeAddress, officeAddress])

  useEffect(function() {
    if (isFormValid && !data.distanceKm && !isCalculatingDistance) {
      const debounceTimer = setTimeout(handleCalculateDistance, 1000)
      return function() { clearTimeout(debounceTimer) }
    }
  }, [isFormValid, data.distanceKm, isCalculatingDistance, handleCalculateDistance])

  const canProceed = isFormValid && (data.distanceKm || calculationError)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Addresses</h2>
        <p className="text-muted-foreground">
          Enter your home and office addresses to automatically calculate commuting distance
        </p>
      </div>

      <div className="grid gap-6">
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
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
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
                              ~{Math.round(duration / 60)} min
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
          disabled={!canProceed}
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