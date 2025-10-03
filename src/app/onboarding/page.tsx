import { Guard } from "@/components/auth/guard"
import OnboardingFlow from "./onboarding-flow"

export default function OnboardingPage() {
  return (
    <Guard requireAuth={true} requireOnboarding={false}>
      <OnboardingFlow />
    </Guard>
  )
}r