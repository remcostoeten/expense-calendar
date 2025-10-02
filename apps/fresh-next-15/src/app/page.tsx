'use client'

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useUser } from '@stackframe/stack'

export default function HomePage() {
  const router = useRouter()
  const user = useUser()

  useEffect(() => {
    if (user) {
      router.push("/dashboard/calendar")
    } else {
      router.push("/auth/signin")
    }
  }, [router, user])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
