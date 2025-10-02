"use client"

import { DualSidebarLayout } from "@/components/sidebar/dual-sidebar-layout"
import BigCalendar from "@/features/calendar/components/big-calendar"
import { RightSidebarTrigger } from "@/components/sidebar/app-sidebar"
import { withAuth } from "@/lib/auth/with-auth"
import type { User } from "@/lib/types/auth"

interface CalendarPageProps {
  user: User
}

function CalendarPage({ user }: CalendarPageProps) {
  return (
    <DualSidebarLayout>
      <div className="flex flex-1 flex-col gap-3 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight">Calendar</h1>
          <RightSidebarTrigger />
        </div>
        <BigCalendar userId={user.id.toString()} />
      </div>
    </DualSidebarLayout>
  )
}

export default withAuth(CalendarPage)
