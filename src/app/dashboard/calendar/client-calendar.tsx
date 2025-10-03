"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import CalendarPageWrapper from "@/features/calendar/components/calendar-page-wrapper"
import { withAuth } from "@/lib/auth/with-auth"
import { toast } from "sonner"
import { useStackAuthHelper } from "@/lib/auth/stack-auth-helper"

interface ClientCalendarProps {
  user: any
}

function ClientCalendar({ user }: ClientCalendarProps) {
  const searchParams = useSearchParams()
  const { getInternalUserId } = useStackAuthHelper()
  const [internalUserId, setInternalUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      toast.success(success)
    }

    if (error) {
      toast.error(error)
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

  const isLoading = loading || !internalUserId

  return isLoading ? (
    <div className="p-4">
      <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
      <div className="h-[500px] w-full bg-muted rounded animate-pulse" />
    </div>
  ) : (
    <CalendarPageWrapper userId={internalUserId} />
  )
}

export default withAuth(ClientCalendar)