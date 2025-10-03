"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { completeOnboardingAction } from "@/modules/onboarding/server/actions"
import { clearOnboardingCache } from "@/components/auth/onboarding-guard"
import { CommuteMethodStep } from "./steps/commute-method-step"
import { AllowanceInfoStep } from "./steps/allowance-info-step"
import { AddressesStep } from "./steps/addresses-step"
import { OfficeDaysStep } from "./steps/office-days-step"
import { HomeOfficeStep } from "./steps/home-office-step"
import { SummaryStep } from "./steps/summary-step"
import { toast } from "sonner"


export type TOnboarding = {
  commuteMethod: 'car' | 'public_transport' | 'walking' | 'bike'
  kmAllowance: number
  publicTransportCost?: number
  homeOfficeAllowance: number
  homeAddress: string
  homePostalCode: string
  homeCity: string
  homeStreet: string
  
  officeAddress: string
  officePostalCode: string
  officeCity: string
  officeStreet: string
  distanceKm?: number
  hasFixedOfficeDays: boolean
  fixedOfficeDays: number[]
  
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
  const [isCompleting, setIsCompleting] = useState(false)
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

  function updateData(updates: Partial<TOnboarding>) {
    setData(prev => ({ ...prev, ...updates }))
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function completeOnboarding() {
    if (!user) {
      toast.error("You must be logged in to complete onboarding.")
      return
    }

    setIsCompleting(true)
    
    try {
      const result = await completeOnboardingAction(user.id, data)
      
      if (result.success) {
        clearOnboardingCache(user.id)
        toast.success("Onboarding completed successfully! Welcome to Comutorino.")
        router.push('/dashboard/calendar')
      } else {
        toast.error(result.error || "Failed to complete onboarding. Please try again.")
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsCompleting(false)
    }
  }

  if (!user) {
    router.push('/auth/signin')
    return null
  }

  const currentStepData = STEPS[currentStep]
  const StepComponent = currentStepData.component

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
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
            <Button onClick={completeOnboarding} disabled={isCompleting}>
              {isCompleting ? "Completing..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}