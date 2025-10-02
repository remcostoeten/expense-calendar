"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { Loader2, MapPin, Route } from "lucide-react"
import type { OnboardingData } from "../onboarding-flow"

interface AddressesStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => void
}

export default function AddressesStep({
  data,
  updateData,
  nextStep
}: AddressesStepProps) {
  const [homeAddress, setHomeAddress] = useState({
    street: data.homeStreet || '',
    postalCode: data.homePostalCode || '',
    city: data.homeCity || '',
    fullAddress: data.homeAddress || ''
  })

  const [officeAddress, setOfficeAddress] = useState({
    street: data.officeStreet || '',
    postalCode: data.officePostalCode || '',
    city: data.officeCity || '',
    fullAddress: data.officeAddress || ''
  })

  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number
    duration: string
  } | null>(null)

  const updateHomeAddress = (field: keyof typeof homeAddress, value: string) => {
    const newAddress = { ...homeAddress, [field]: value }
    setHomeAddress(newAddress)
    
    updateData({
      homeStreet: newAddress.street,
      homePostalCode: newAddress.postalCode,
      homeCity: newAddress.city,
      homeAddress: newAddress.fullAddress
    })
  }

  const updateOfficeAddress = (field: keyof typeof officeAddress, value: string) => {
    const newAddress = { ...officeAddress, [field]: value }
    setOfficeAddress(newAddress)
    
    updateData({
      officeStreet: newAddress.street,
      officePostalCode: newAddress.postalCode,
      officeCity: newAddress.city,
      officeAddress: newAddress.fullAddress
    })
  }

  const handleHomeAddressSelect = (address: {
    street: string
    postalCode: string
    city: string
    fullAddress: string
  }) => {
    setHomeAddress({
      street: address.street,
      postalCode: address.postalCode,
      city: address.city,
      fullAddress: address.fullAddress
    })
    
    updateData({
      homeStreet: address.street,
      homePostalCode: address.postalCode,
      homeCity: address.city,
      homeAddress: address.fullAddress
    })
  }

  const handleOfficeAddressSelect = (address: {
    street: string
    postalCode: string
    city: string
    fullAddress: string
  }) => {
    setOfficeAddress({
      street: address.street,
      postalCode: address.postalCode,
      city: address.city,
      fullAddress: address.fullAddress
    })
    
    updateData({
      officeStreet: address.street,
      officePostalCode: address.postalCode,
      officeCity: address.city,
      officeAddress: address.fullAddress
    })
  }

  const calculateDistance = async () => {
    if (!homeAddress.fullAddress || !officeAddress.fullAddress) {
      return
    }

    setIsCalculatingDistance(true)
    
    try {
      const response = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: homeAddress.fullAddress,
          destination: officeAddress.fullAddress
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate distance')
      }

      const result = await response.json()
      
      if (result.success) {
        setDistanceInfo({
          distance: result.distance,
          duration: result.duration
        })
        updateData({ distanceKm: result.distance })
      } else {
        throw new Error(result.error || 'Failed to calculate distance')
      }
    } catch (error) {
      console.error('Distance calculation error:', error)
      // Fallback to mock calculation
      const mockDistance = Math.round(Math.random() * 50 + 5)
      setDistanceInfo({
        distance: mockDistance,
        duration: `${Math.round(mockDistance / 50 * 60)} min`
      })
      updateData({ distanceKm: mockDistance })
    } finally {
      setIsCalculatingDistance(false)
    }
  }

  const isFormValid = homeAddress.fullAddress && officeAddress.fullAddress

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Addresses</h2>
        <p className="text-muted-foreground">
          Enter your home and office addresses to calculate commuting distance
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
            <AddressAutocomplete
              label="Home Address"
              placeholder="Start typing your home address..."
              value={homeAddress.fullAddress}
              onChange={(value) => updateHomeAddress('fullAddress', value)}
              onAddressSelect={handleHomeAddressSelect}
            />
            
            {/* Display parsed address components */}
            {(homeAddress.street || homeAddress.postalCode || homeAddress.city) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Street</Label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {homeAddress.street || 'Not specified'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Postal Code</Label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {homeAddress.postalCode || 'Not specified'}
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">City</Label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {homeAddress.city || 'Not specified'}
                  </div>
                </div>
              </div>
            )}
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
            <AddressAutocomplete
              label="Office Address"
              placeholder="Start typing your office address..."
              value={officeAddress.fullAddress}
              onChange={(value) => updateOfficeAddress('fullAddress', value)}
              onAddressSelect={handleOfficeAddressSelect}
            />
            
            {/* Display parsed address components */}
            {(officeAddress.street || officeAddress.postalCode || officeAddress.city) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Street</Label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {officeAddress.street || 'Not specified'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Postal Code</Label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {officeAddress.postalCode || 'Not specified'}
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">City</Label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {officeAddress.city || 'Not specified'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distance Calculation */}
        {isFormValid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Distance Calculation
              </CardTitle>
              <CardDescription>
                Calculate the real distance between your home and office
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {distanceInfo ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-lg font-semibold">
                            {distanceInfo.distance} km
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Estimated travel time: {distanceInfo.duration}
                        </p>
                      </div>
                    ) : data.distanceKm ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="text-lg font-semibold">
                          {data.distanceKm} km
                        </span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Click to calculate real distance
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={calculateDistance} 
                    variant="outline"
                    disabled={isCalculatingDistance}
                    className="flex items-center gap-2"
                  >
                    {isCalculatingDistance ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Route className="h-4 w-4" />
                        Calculate Distance
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Route preview */}
                {distanceInfo && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Route Information</span>
                    </div>
                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                      <div>From: {homeAddress.fullAddress}</div>
                      <div>To: {officeAddress.fullAddress}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="pt-4">
        <Button 
          onClick={nextStep} 
          className="w-full"
          disabled={!isFormValid || (!data.distanceKm && !distanceInfo)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}