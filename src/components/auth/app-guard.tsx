"use client"

import { OnboardingGuard } from "./onboarding-guard"

type TProps = {
  children: React.ReactNode
  requireAuth?: boolean
  requireOnboarding?: boolean
}

export function AppGuard({ children, requireAuth = true, requireOnboarding = true }: TProps) {
  return (
    <OnboardingGuard requireAuth={requireAuth} requireOnboarding={requireOnboarding}>
      {children}
    </OnboardingGuard>
  )
}
