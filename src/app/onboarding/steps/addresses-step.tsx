"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AddressAutocompleteInput } from "@/modules/commute/components/address-autocomplete-input"
import { MapPin, Navigation, Calculator } from "lucide-react"
import type { OnboardingData } from "../onboarding-flow"
import { calculateDistanceAndGeocode } from "@/modules/commute"

interface AddressesStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
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
}: AddressesStepProps) {
  const [homeCoordinates, setHomeCoordinates] = useState({ latitude: 0, longitude: 0 })
  const [officeCoordinates, setOfficeCoordinates] = useState({ latitude: 0, longitude: 0 })

  const handleHomeAddressChange = (address: any) => {
    updateData({
      homeStreet: address.street,
      homePostalCode: address.postalCode,
      homeCity: address.city,
      homeAddress: address.formattedAddress
    })
    setHomeCoordinates(address.coordinates)
  }

  const handleOfficeAddressChange = (address: any) => {
    updateData({
      officeStreet: address.street,
      officePostalCode: address.postalCode,
      officeCity: address.city,
      officeAddress: address.formattedAddress
    })
    setOfficeCoordinates(address.coordinates)
  }

  async function calculateDistance() {
    const distance = await calculateDistanceAndGeocode(data.homeAddress, data.officeAddress, data.commuteMethod)
    updateData({ distanceKm: distance?.route?.distanceKm })
    console.log(distance)
  }


  const isFormValid = data.homeAddress && data.officeAddress

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Addresses</h2>
        <p className="text-muted-foreground">
          Let's set up your home and office addresses for accurate distance calculations
        </p>
      </div>

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
        <CardContent>
          <AddressAutocompleteInput
            label="Home Address"
            placeholder="Search for your home address..."
            value={data.homeAddress || ''}
            onChange={handleHomeAddressChange}
            required
          />
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
        <CardContent>
          <AddressAutocompleteInput
            label="Office Address"
            placeholder="Search for your office address..."
            value={data.officeAddress || ''}
            onChange={handleOfficeAddressChange}
            required
          />
        </CardContent>
      </Card>

      {(homeCoordinates.latitude !== 0 && officeCoordinates.latitude !== 0) && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Navigation className="w-5 h-5" />
              Route Information
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              Distance and route details for your commute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">
                  <strong>From:</strong> {data.homeAddress}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm">
                  <strong>To:</strong> {data.officeAddress}
                </span>
              </div>
            </div>
            
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-700 dark:text-green-300" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Distance: {data.distanceKm} km
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={calculateDistance}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Distance
                </Button>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button 
          onClick={nextStep} 
          disabled={!isFormValid}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next: Office Days
        </Button>
      </div>
    </div>
  )
}