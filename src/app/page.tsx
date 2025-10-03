import { OnboardingGuard } from "@/components/auth/onboarding-guard";

export default function HomePage() {
  return (
    <OnboardingGuard requireAuth={true} requireOnboarding={true}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Welcome to Comutorino</h1>
          <p className="text-muted-foreground">
            Your commute tracking dashboard
          </p>
        </div>
      </div>
    </OnboardingGuard>
  )
}
