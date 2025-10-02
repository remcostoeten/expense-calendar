"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { useToast } from "@/components/ui/use-toast"

function ClientCalendar() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const user = useUser()

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      toast({
        title: "Success",
        description: success,
      })
    }

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Calendar Dashboard</h1>
      <p>Welcome to your calendar, {user.displayName || user.primaryEmail}!</p>
      {/* TODO: Add calendar functionality here */}
    </div>
  )
}

export default ClientCalendar
