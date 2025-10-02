import ClientCalendar from "./client-calendar"

export const dynamic = "force-dynamic"

export default function CalendarPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
          <ClientCalendar />
      </div>
    </div>
  )
}