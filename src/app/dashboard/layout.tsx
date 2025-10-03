import { OnboardingGuard } from "@/components/auth/onboarding-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardingGuard requireOnboarding={true}>
      {children}
    </OnboardingGuard>
  )
}
