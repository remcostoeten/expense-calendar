"use client"

import CalendarPageWrapper from "@/features/calendar/components/calendar-page-wrapper"
import { withAuth } from "@/lib/auth/with-auth"
import type { User } from "@/lib/types/auth"

interface ClientCalendarProps {
  user: User
}

function ClientCalendar({ user }: ClientCalendarProps) {
  return <CalendarPageWrapper userId={user.id.toString()} />
}

export default withAuth(ClientCalendar)