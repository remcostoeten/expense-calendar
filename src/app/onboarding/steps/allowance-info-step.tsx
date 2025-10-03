"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { OnboardingData } from "../onboarding-flow"

interface AllowanceInfoStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => void
}

export function AllowanceInfoStep({
  data,
  updateData,
  nextStep
}: AllowanceInfoStepProps) {
  const [kmAllowance, setKmAllowance] = useState<string>(
    data.kmAllowance.toString()
  )
  const [homeOfficeAllowance, setHomeOfficeAllowance] = useState<string>(
    data.homeOfficeAllowance.toString()
  )

  const handleKmAllowanceChange = (value: string) => {
    setKmAllowance(value)
    updateData({
      kmAllowance: parseFloat(value) || 0
    })
  }

  const handleHomeOfficeAllowanceChange = (value: string) => {
    setHomeOfficeAllowance(value)
    updateData({
      homeOfficeAllowance: parseFloat(value) || 0
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Allowance Information</h2>
        <p className="text-muted-foreground">
          Set your allowance rates for commuting and working from home
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💰</span>
              Kilometer Allowance
            </CardTitle>
            <CardDescription>
              Amount you receive per kilometer traveled to work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="km-allowance">Allowance per km (€)</Label>
              <Input
                id="km-allowance"
                type="number"
                step="0.01"
                value={kmAllowance}
                onChange={(e) => handleKmAllowanceChange(e.target.value)}
                placeholder="0.23"
              />
              <p className="text-sm text-muted-foreground">
                Standard rate in the Netherlands is €0.23 per km
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🏠</span>
              Home Office Allowance
            </CardTitle>
            <CardDescription>
              Daily allowance for working from home
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="home-office-allowance">Allowance per day (€)</Label>
              <Input
                id="home-office-allowance"
                type="number"
                step="0.01"
                value={homeOfficeAllowance}
                onChange={(e) => handleHomeOfficeAllowanceChange(e.target.value)}
                placeholder="2.00"
              />
              <p className="text-sm text-muted-foreground">
                Standard rate in the Netherlands is €2.00 per day
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Button 
          onClick={nextStep} 
          className="w-full"
          disabled={!kmAllowance || !homeOfficeAllowance}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}