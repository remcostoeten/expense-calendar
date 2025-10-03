"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { checkOnboardingStatusAction } from "@/modules/onboarding/server/actions"

type TProps = {
  children: React.ReactNode
  requireOnboarding?: boolean
}

export function OnboardingGuard({ children, requireOnboarding = true }: TProps) {
  const user = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        router.push('/auth/signin')
        return
      }

      try {
        const result = await checkOnboardingStatusAction(user.id)
        
        if (result.success) {
          setIsOnboardingComplete(result.isCompleted)
          
          if (requireOnboarding && !result.isCompleted) {
            router.push('/onboarding')
            return
          }
          
          if (!requireOnboarding && result.isCompleted) {
            router.push('/dashboard/calendar')
            return
          }
        } else {
          console.error('Failed to check onboarding status:', result.error)
          if (requireOnboarding) {
            router.push('/onboarding')
            return
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        if (requireOnboarding) {
          router.push('/onboarding')
          return
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboarding()
  }, [user, router, requireOnboarding])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireOnboarding && !isOnboardingComplete) {
    return null
  }

  if (!requireOnboarding && isOnboardingComplete) {
    return null
  }

  return <>{children}</>
}

export function clearOnboardingCache(userId: string) {
  // Clear any cached onboarding status
  // This is a placeholder for cache clearing logic
  console.log('Clearing onboarding cache for user:', userId)
}
