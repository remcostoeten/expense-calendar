"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

function ClientCalendar() {
  const searchParams = useSearchParams()
  const user = useUser()

  useEffect(() => {
    if (!user) {
      redirect('/handler/sign-in')
      return
    }

    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      toast.success(success)
    }

    if (error) {
      toast.error(error)
    }
  }, [searchParams, user])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      <div className="bg-card p-6 rounded-lg border">
        <p className="text-muted-foreground">
          Welcome to your calendar, {user.displayName || user.primaryEmail}!
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Calendar functionality will be implemented here.
        </p>
      </div>
    </div>
  )
}

export default ClientCalendar