"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { completeOnboardingAction } from "@/modules/onboarding/server/actions"
import { clearOnboardingCache } from "@/components/auth/guard"
import { CommuteMethodStep } from "./steps/commute-method-step"
import { AllowanceInfoStep } from "./steps/allowance-info-step"
import { AddressesStep } from "./steps/addresses-step"
import { OfficeDaysStep } from "./steps/office-days-step"
import { HomeOfficeStep } from "./steps/home-office-step"
import { SummaryStep } from "./steps/summary-step"

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

type TStep = {
  id: string
  title: string
  component: React.ComponentType<TStepProps>
}

type TStepProps = {
  data: TOnboarding
  updateData: (updates: Partial<TOnboarding>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => Promise<void>
}

const STEPS: TStep[] = [
  { id: 'commute-method', title: 'Commute Method', component: CommuteMethodStep },
  { id: 'allowance-info', title: 'Allowance Info', component: AllowanceInfoStep },
  { id: 'addresses', title: 'Addresses', component: AddressesStep },
  { id: 'office-days', title: 'Office Days', component: OfficeDaysStep },
  { id: 'home-office', title: 'Home Office', component: HomeOfficeStep },
  { id: 'summary', title: 'Summary', component: SummaryStep },
]

const INITIAL_DATA: TOnboarding = {
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
}

export default function OnboardingFlow() {
  const user = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [data, setData] = useState<TOnboarding>(INITIAL_DATA)

  const updateData = useCallback(function(updates: Partial<TOnboarding>) {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(function() {
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
  }, [])

  const prevStep = useCallback(function() {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const completeOnboarding = useCallback(async function() {
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
  }, [user, data, router])

  const currentStepData = useMemo(function() {
    return STEPS[currentStep]
  }, [currentStep])

  const progress = useMemo(function() {
    return ((currentStep + 1) / STEPS.length) * 100
  }, [currentStep])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === STEPS.length - 1

  if (!user) {
    router.push('/handler/[...stack]')
    return null
  }

  const StepComponent = currentStepData.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
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
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              completeOnboarding={completeOnboarding}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep}
          >
            Previous
          </Button>
          
          {isLastStep ? (
            <Button onClick={completeOnboarding} disabled={isCompleting}>
              {isCompleting ? "Completing..." : "Complete Setup"}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}