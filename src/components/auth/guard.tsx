"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from '@stackframe/stack'
import { checkOnboardingStatus } from "@/modules/onboarding/server/actions"
import { Loader2 } from "lucide-react"

type TProps = {
  children: React.ReactNode
  requireAuth?: boolean
  requireOnboarding?: boolean
  fallback?: React.ReactNode
}

// Global cache for onboarding status
const onboardingCache = new Map<string, { completed: boolean; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function clearOnboardingCache(userId: string) {
  onboardingCache.delete(userId)
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function Guard({ 
  children, 
  requireAuth = true, 
  requireOnboarding = true,
  fallback
}: TProps) {
  const router = useRouter()
  const user = useUser()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Skip auth check if not required
  if (!requireAuth && !user) {
    return <>{children}</>
  }

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push("/handler/sign-in")
        return
      }

      // Check cache first for onboarding status
      if (requireOnboarding) {
        const cached = onboardingCache.get(user.id)
        const now = Date.now()
        
        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
          const hasCompleted = cached.completed
          
          if (!hasCompleted) {
            router.push("/onboarding")
            return
          }

          setIsAuthorized(true)
          setIsChecking(false)
          return
        }

        try {
          const result = await checkOnboardingStatus(user.id)
          const hasCompleted = result.success && result.completed
          
          // Cache the result
          onboardingCache.set(user.id, { completed: hasCompleted, timestamp: now })

          if (!hasCompleted) {
            router.push("/onboarding")
            return
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          router.push("/onboarding")
          return
        }
      }

      setIsAuthorized(true)
      setIsChecking(false)
    }

    checkAccess()
  }, [router, user, requireOnboarding])

  if (isChecking) {
    return fallback || <LoadingFallback />
  }

  if (!isAuthorized) {
    return fallback || <LoadingFallback />
  }

  return <>{children}</>
}

// Convenience exports for different use cases
export const AuthGuard = Guard
export const OnboardingGuard = Guard
export const AppGuard = Guard
