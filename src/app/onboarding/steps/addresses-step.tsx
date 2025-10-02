"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
    city: data.homeCity || ''
  })

  const [officeAddress, setOfficeAddress] = useState({
    street: data.officeStreet || '',
    postalCode: data.officePostalCode || '',
    city: data.officeCity || ''
  })

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

  const calculateDistance = async () => {
    // TODO: Implement distance calculation using a mapping service
    // For now, we'll use a mock calculation
    const mockDistance = Math.round(Math.random() * 50 + 5) // 5-55 km
    updateData({ distanceKm: mockDistance })
  }

  const isFormValid = homeAddress.street && homeAddress.postalCode && homeAddress.city &&
                     officeAddress.street && officeAddress.postalCode && officeAddress.city

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

        {/* Distance Calculation */}
        {isFormValid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📏</span>
                Distance Calculation
              </CardTitle>
              <CardDescription>
                Calculate the distance between your home and office
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {data.distanceKm ? (
                    <p className="text-lg font-semibold">
                      Distance: {data.distanceKm} km
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Click to calculate distance
                    </p>
                  )}
                </div>
                <Button onClick={calculateDistance} variant="outline">
                  Calculate Distance
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="pt-4">
        <Button 
          onClick={nextStep} 
          className="w-full"
          disabled={!isFormValid || !data.distanceKm}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}