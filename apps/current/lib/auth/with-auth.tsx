"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import type { User } from "@/lib/types/auth"

import { useAuth } from "./auth-context"

interface WithAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
  loadingComponent?: React.ComponentType
}

// Higher-Order Component for authentication
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P & { user: User }>,
  options: WithAuthOptions = {},
) {
  const { redirectTo = "/auth/signin", requireAuth = true, loadingComponent: LoadingComponent } = options

  const AuthenticatedComponent = (props: P) => {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && requireAuth && !isAuthenticated) {
        router.push(redirectTo)
      }
    }, [isLoading, isAuthenticated, router, redirectTo])

    // Show loading state
    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />
      }
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )
    }

    // Redirect if not authenticated (handled by useEffect, but prevent flash)
    if (requireAuth && !isAuthenticated) {
      return null
    }

    // Only render if we have a user (should be guaranteed by auth checks above)
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h3 className="text-lg font-medium text-muted-foreground">Authentication Error</h3>
            <p className="text-sm text-muted-foreground">Unable to load user data</p>
          </div>
        </div>
      )
    }

    // Render the wrapped component with user prop
    return <WrappedComponent {...props} user={user} />
  }

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`

  return AuthenticatedComponent
}

// Convenience hook for protected pages
export function useRequireAuth(redirectTo = "/auth/signin") {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  return { user, isLoading, isAuthenticated }
}