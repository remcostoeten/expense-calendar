import { DualSidebarLayout, RightSidebarTrigger } from "@/components/sidebar"
import { CalendarSkeleton } from "@/features/calendar/components/calendar-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

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