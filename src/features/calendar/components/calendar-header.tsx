import { format, startOfWeek, endOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RightSidebarTrigger } from "@/components/sidebar"
import { cn } from "@/lib/utils"

type TCalendarView = "day" | "week" | "month" | "year"

type TProps = {
  view: TCalendarView
  currentDate: Date
  onViewChange: (view: TCalendarView) => void
  onNavigate: (direction: "prev" | "next") => void
  onTodayClick: () => void
  onJumpToCurrentTime: () => void
  onAddEvent: () => void
}

export function CalendarHeader({
  view,
  currentDate,
  onViewChange,
  onNavigate,
  onTodayClick,
  onJumpToCurrentTime,
  onAddEvent,
}: TProps) {
  function getViewTitle() {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy")
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
      case "month":
        return format(currentDate, "MMMM yyyy")
      case "year":
        return format(currentDate, "yyyy")
      default:
        return ""
    }
  }

  return (
    <div className="sticky top-0 z-40 flex flex-col gap-2 p-2 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold transition-all duration-300 truncate">
            {getViewTitle()}
          </h2>
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("prev")}
              className="transition-all duration-200 hover:scale-105 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              aria-label={`Previous ${view}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("next")}
              className="transition-all duration-200 hover:scale-105 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              aria-label={`Next ${view}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTodayClick}
              className="ml-1 sm:ml-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
            >
              Today
            </Button>
            {(view === "week" || view === "day") && (
              <Button
                variant="outline"
                size="sm"
                onClick={onJumpToCurrentTime}
                className="ml-1 transition-all duration-200 hover:scale-105 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                title="Jump to current time"
              >
                <Clock className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border rounded-md p-1" role="tablist" aria-label="Calendar views">
            {(["day", "week", "month", "year"] as TCalendarView[]).map((viewOption) => (
              <Button
                key={viewOption}
                variant={view === viewOption ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange(viewOption)}
                className={cn(
                  "transition-all duration-200 capitalize text-xs px-2 h-8",
                  view === viewOption && "shadow-sm",
                )}
                role="tab"
                aria-selected={view === viewOption}
                aria-controls="calendar-content"
              >
                {viewOption}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            className="transition-all duration-200 hover:scale-105 text-xs h-8 px-2 sm:px-3"
            onClick={onAddEvent}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Add</span>
          </Button>

          <RightSidebarTrigger />
        </div>
      </div>
    </div>
  )
}