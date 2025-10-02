import { DualSidebarLayout } from "@/components/sidebar/dual-sidebar-layout"
import { CalendarSkeleton } from "@/features/calendar/components/calendar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { RightSidebarTrigger } from "@/components/sidebar/app-sidebar"

export default function CalendarLoading() {
  return (
    <DualSidebarLayout>
      <div className="flex flex-1 flex-col gap-3 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
          <RightSidebarTrigger />
        </div>
        <CalendarSkeleton initialView="week" currentDate={new Date()} />
      </div>
    </DualSidebarLayout>
  )
}