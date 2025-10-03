"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Bus, Footprints, Bike } from "lucide-react"
import type { OnboardingData } from "../onboarding-flow"

interface CommuteMethodStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => void
}

const COMMUTE_METHODS = [
  {
    id: 'car' as const,
    name: 'Car',
    icon: Car,
    description: '€0.23 per km allowance',
    defaultAllowance: 0.23
  },
  {
    id: 'public_transport' as const,
    name: 'Public Transport',
    icon: Bus,
    description: 'Monthly subscription cost',
    defaultAllowance: 0
  },
  {
    id: 'walking' as const,
    name: 'Walking',
    icon: Footprints,
    description: '€0 per km (no allowance)',
    defaultAllowance: 0
  },
  {
    id: 'bike' as const,
    name: 'Bike',
    icon: Bike,
    description: '€0 per km (no allowance)',
    defaultAllowance: 0
  }
]

export function CommuteMethodStep({
  data,
  updateData,
  nextStep
}: CommuteMethodStepProps) {
  const [publicTransportCost, setPublicTransportCost] = useState<string>(
    data.publicTransportCost?.toString() || '0'
  )

  const handleMethodSelect = (method: typeof COMMUTE_METHODS[0]) => {
    updateData({
      commuteMethod: method.id,
      kmAllowance: method.defaultAllowance,
      publicTransportCost: method.id === 'public_transport' ? parseFloat(publicTransportCost) : undefined
    })
  }

  const handlePublicTransportCostChange = (value: string) => {
    setPublicTransportCost(value)
    if (data.commuteMethod === 'public_transport') {
      updateData({
        publicTransportCost: parseFloat(value) || 0
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">How do you commute to work?</h2>
        <p className="text-muted-foreground">
          Choose your primary commute method to calculate your allowances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMMUTE_METHODS.map((method) => {
          const Icon = method.icon
          const isSelected = data.commuteMethod === method.id

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {data.commuteMethod === 'public_transport' && (
        <div className="space-y-2">
          <Label htmlFor="public-transport-cost">Monthly subscription cost (€)</Label>
          <Input
            id="public-transport-cost"
            type="number"
            step="0.01"
            value={publicTransportCost}
            onChange={(e) => handlePublicTransportCostChange(e.target.value)}
            placeholder="e.g., 89.50"
          />
          <p className="text-sm text-muted-foreground">
            Enter your monthly public transport subscription cost
          </p>
        </div>
      )}

      <div className="pt-4">
        <Button 
          onClick={nextStep} 
          className="w-full"
          disabled={!data.commuteMethod}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}