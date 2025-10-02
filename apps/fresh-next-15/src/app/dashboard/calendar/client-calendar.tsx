"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import CalendarPageWrapper from "@/features/calendar/components/calendar-page-wrapper"
import { withAuth } from "@/lib/auth/with-auth"
import { useToast } from "@/components/ui/use-toast"
import { useStackAuthHelper } from "@/lib/auth/stack-auth-helper"

interface ClientCalendarProps {
  user: any
}

function ClientCalendar({ user }: ClientCalendarProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { getInternalUserId } = useStackAuthHelper()
  const [internalUserId, setInternalUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const fetchInternalUserId = async () => {
      try {
        const id = await getInternalUserId()
        setInternalUserId(id?.toString() || null)
      } catch (error) {
        console.error('Error fetching internal user ID:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchInternalUserId()
    }
  }, [user, getInternalUserId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!internalUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">Authentication Error</h3>
          <p className="text-sm text-muted-foreground">Unable to load user data</p>
        </div>
      </div>
    )
  }

  return <CalendarPageWrapper userId={internalUserId} />
}

export default withAuth(ClientCalendar)