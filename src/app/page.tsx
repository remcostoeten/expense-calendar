'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from '@stackframe/stack'
import { checkOnboardingStatus } from "@/modules/onboarding/server/actions"

export default function HomePage() {
  const router = useRouter()
  const user = useUser()
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      try {
        const result = await checkOnboardingStatus(user.id)
        
        if (!result.success || !result.completed) {
          router.push("/onboarding")
        } else {
          router.push("/dashboard/calendar")
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        router.push("/onboarding")
      } finally {
        setIsCheckingOnboarding(false)
      }
    }

    checkUserAndRedirect()
  }, [router, user])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
        <p className="text-muted-foreground">
          {isCheckingOnboarding ? 'Setting up your commute tracker...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}
