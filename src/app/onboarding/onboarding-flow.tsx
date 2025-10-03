"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Import step components
import CommuteMethodStep from "./steps/commute-method-step"
import AllowanceInfoStep from "./steps/allowance-info-step"
import { AddressesStep } from "./steps/addresses-step"
import OfficeDaysStep from "./steps/office-days-step"
import HomeOfficeStep from "./steps/home-office-step"
import SummaryStep from "./steps/summary-step"

export type TOnboarding = {
  // Commute method
  commuteMethod: 'car' | 'public_transport' | 'walking' | 'bike'
  kmAllowance: number
  publicTransportCost?: number
  
  // Home office allowance
  homeOfficeAllowance: number
  
  // Addresses
  homeAddress: string
  homePostalCode: string
  homeCity: string
  homeStreet: string
  
  officeAddress: string
  officePostalCode: string
  officeCity: string
  officeStreet: string
  
  // Distance
  distanceKm?: number
  
  // Office days
  hasFixedOfficeDays: boolean
  fixedOfficeDays: number[]
  
  // Home office days
  hasHomeOfficeAllowance: boolean
  homeOfficeDays: number[]
}

const STEPS = [
  { id: 'commute-method', title: 'Commute Method', component: CommuteMethodStep },
  { id: 'allowance-info', title: 'Allowance Info', component: AllowanceInfoStep },
  { id: 'addresses', title: 'Addresses', component: AddressesStep },
  { id: 'office-days', title: 'Office Days', component: OfficeDaysStep },
  { id: 'home-office', title: 'Home Office', component: HomeOfficeStep },
  { id: 'summary', title: 'Summary', component: SummaryStep },
]

export default function OnboardingFlow() {
  const user = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<TOnboarding>({
    commuteMethod: 'car',
    kmAllowance: 0.23,
    homeOfficeAllowance: 2.00,
    homeAddress: '',
    homePostalCode: '',
    homeCity: '',
    homeStreet: '',
    officeAddress: '',
    officePostalCode: '',
    officeCity: '',
    officeStreet: '',
    hasFixedOfficeDays: false,
    fixedOfficeDays: [],
    hasHomeOfficeAllowance: false,
    homeOfficeDays: [],
  })

  const updateData = (updates: Partial<TOnboarding>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    // TODO: Save data to database
    console.log('Completing onboarding with data:', data)
    
    // For now, just redirect to dashboard
    router.push('/dashboard/calendar')
  }

  if (!user) {
    router.push('/auth/signin')
    return null
  }

  const currentStepData = STEPS[currentStep]
  const StepComponent = currentStepData.component

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <h1 className="text-xl font-semibold mt-2">{currentStepData.title}</h1>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            <StepComponent
              data={data}
              updateData={updateData}
              nextStep={nextStep}
              prevStep={prevStep}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === STEPS.length - 1}
              completeOnboarding={completeOnboarding}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={completeOnboarding}>
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}