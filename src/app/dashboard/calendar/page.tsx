import { OnboardingGuard } from "@/components/auth/onboarding-guard"
import ClientCalendar from "./client-calendar"

export const dynamic = "force-dynamic"

export default function CalendarPage() {
  return (
    <OnboardingGuard requireOnboarding={true}>
      <ClientCalendar />
    </OnboardingGuard>
  )
}
