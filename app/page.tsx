'use client'
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/router"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard/calendar")
      } else {
        router.push("/auth/signin")
      }
    }
  }, [router, isAuthenticated, isLoading])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
        <p className="text-muted-foreground">{isLoading ? "Checking authentication..." : "Redirecting..."}</p>
      </div>
    </div>
  )
}
