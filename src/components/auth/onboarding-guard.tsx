"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from '@stackframe/stack'
import { checkOnboardingStatus } from "@/modules/onboarding/server/actions"
import { Loader2 } from "lucide-react"

type TProps = {
  children: React.ReactNode
  requireOnboarding?: boolean
}

// Cache onboarding status to avoid repeated server calls
const onboardingCache = new Map<string, { completed: boolean; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to clear cache when onboarding is completed
export function clearOnboardingCache(userId: string) {
  onboardingCache.delete(userId)
}

export function OnboardingGuard({ children, requireOnboarding = true }: TProps) {
  const router = useRouter()
  const user = useUser()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      // Check cache first
      const cached = onboardingCache.get(user.id)
      const now = Date.now()
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        const hasCompleted = cached.completed
        
        if (requireOnboarding && !hasCompleted) {
          router.push("/onboarding")
          return
        }

        if (!requireOnboarding && hasCompleted) {
          router.push("/dashboard/calendar")
          return
        }

        setIsAuthorized(true)
        setIsChecking(false)
        setShowContent(true)
        return
      }

      try {
        const result = await checkOnboardingStatus(user.id)
        const hasCompleted = result.success && result.completed
        
        // Cache the result
        onboardingCache.set(user.id, { completed: hasCompleted, timestamp: now })

        if (requireOnboarding && !hasCompleted) {
          router.push("/onboarding")
          return
        }

        if (!requireOnboarding && hasCompleted) {
          router.push("/dashboard/calendar")
          return
        }

        setIsAuthorized(true)
        setShowContent(true)
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

  if (!showContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
