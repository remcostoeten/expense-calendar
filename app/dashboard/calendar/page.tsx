"use client"

import CalendarPageWrapper from "@/features/calendar/components/calendar-page-wrapper"
import { withAuth } from "@/lib/auth/with-auth"
import type { User } from "@/lib/types/auth"

interface CalendarPageProps {
  user: User
}

function CalendarPage({ user }: CalendarPageProps) {
  return <CalendarPageWrapper userId={user.id.toString()} />
}

export default withAuth(CalendarPage)
