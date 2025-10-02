"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, User } from "@/lib/types/auth"
import { MockAuthService } from "./mock-auth"

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const authService = MockAuthService.getInstance()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!mounted) return
    
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.getCurrentUser()
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: authService.isAuthenticated(),
      })
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [mounted, authService])

  const signIn = async (email: string, password: string): Promise<User> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.signIn(email, password)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
      return user
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      await authService.signOut()
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } catch (error) {
      console.error("Failed to sign out:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    if (mounted) {
      refreshUser()
    }
  }, [mounted, refreshUser])

  const value: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
