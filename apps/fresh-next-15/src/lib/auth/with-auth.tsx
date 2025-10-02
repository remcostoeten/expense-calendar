"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@stackframe/stack'

interface WithAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
  loadingComponent?: React.ComponentType
}

// Higher-Order Component for authentication
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P & { user: any }>,
  options: WithAuthOptions = {},
) {
  const { redirectTo = "/handler/sign-in", requireAuth = true, loadingComponent: LoadingComponent } = options

  const AuthenticatedComponent = (props: P) => {
    const user = useUser()
    const router = useRouter()

    useEffect(() => {
      if (requireAuth && !user) {
        router.push(redirectTo)
      }
    }, [user, router, redirectTo, requireAuth])

    // Show loading state
    if (requireAuth && !user) {
      if (LoadingComponent) {
        return <LoadingComponent />
      }
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )
    }

    // Only render if we have a user (should be guaranteed by auth checks above)
    if (requireAuth && !user) {
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
export function useRequireAuth(redirectTo = "/handler/sign-in") {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  return { user, isLoading: !user, isAuthenticated: !!user }
}