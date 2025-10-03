import { OnboardingGuard } from "@/components/auth/onboarding-guard"
import OnboardingFlow from "./onboarding-flow"

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <OnboardingGuard requireOnboarding={false}>
      <OnboardingFlow />
    </OnboardingGuard>
  )
}