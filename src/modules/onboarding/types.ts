import type { TOnboarding } from "../../app/onboarding/onboarding-flow"

export type TAddress = {
  street: string
  postalCode: string
  city: string
}

export type TStepProps = {
  data: TOnboarding
  updateData: (updates: Partial<TOnboarding>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => void
}
