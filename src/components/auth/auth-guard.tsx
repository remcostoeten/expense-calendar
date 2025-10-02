"use client"

import type React from "react"
import { useUser } from '@stackframe/stack'
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

// Component-based auth guard (alternative to HoC)
export function AuthGuard({ children, fallback, redirectTo = "/auth/signin", requireAuth = true }: AuthGuardProps) {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && !user) {
      router.push(redirectTo)
    }
  }, [user, requireAuth, redirectTo, router])

  if (requireAuth && !user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    )
  }

  return <>{children}</>
}
