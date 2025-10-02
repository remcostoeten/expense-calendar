"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import CalendarPageWrapper from "@/features/calendar/components/calendar-page-wrapper"
import { withAuth } from "@/lib/auth/with-auth"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/types/auth"

interface ClientCalendarProps {
  user: User
}

function ClientCalendar({ user }: ClientCalendarProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()

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

  return <CalendarPageWrapper userId={user.id.toString()} />
}

export default withAuth(ClientCalendar)