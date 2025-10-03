import { AppGuard } from "@/components/auth/app-guard"
import OnboardingFlow from "./onboarding-flow"

export default function OnboardingPage() {
  return (
    <AppGuard requireAuth={true} requireOnboarding={false}>
      <OnboardingFlow />
    </AppGuard>
  )
}