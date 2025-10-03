"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from '@stackframe/stack'
import { checkOnboardingStatus } from "@/modules/onboarding/server/actions"

type TProps = {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export function OnboardingGuard({ children, requireOnboarding = true }: TProps) {
  const router = useRouter()
  const user = useUser()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      try {
        const result = await checkOnboardingStatus(user.id)
        const hasCompleted = result.success && result.completed

        if (requireOnboarding && !hasCompleted) {
          router.push("/onboarding")
          return
        }

        if (!requireOnboarding && hasCompleted) {
          router.push("/dashboard/calendar")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        if (requireOnboarding) {
          router.push("/onboarding")
        } else {
          router.push("/auth/signin")
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [router, user, requireOnboarding])

  if (isChecking || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}