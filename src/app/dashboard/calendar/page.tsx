import { AppGuard } from "@/components/auth/app-guard"
import ClientCalendar from "./client-calendar"

export const dynamic = "force-dynamic"

export default function CalendarPage() {
  return (
    <AppGuard requireAuth={true} requireOnboarding={true}>
      <ClientCalendar />
    </AppGuard>
  )
}
