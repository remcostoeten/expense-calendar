"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth,
  isToday 
} from "date-fns"
import { cn } from "@/lib/utils"

type TProps = {
    initialView?: "day" | "week" | "month" | "year"
    currentDate?: Date
}

export function CalendarSkeleton({ initialView = "week", currentDate = new Date() }: TProps) {
  const [view, setView] = useState<"day" | "week" | "month" | "year">(initialView)
  const renderDayView = () => {
    return (
      <div className="flex-1 relative">
        {/* Header - show actual date */}
        <div className="sticky top-0 z-30 bg-background/98 supports-[backdrop-filter]:bg-background/95 border-b shadow-sm">
          <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr]">
            <div className="border-r p-1 sm:p-2 flex items-center justify-center">
              <div className="bg-primary/10 border border-primary/20 rounded px-1 sm:px-2 py-1 text-xs font-medium text-primary">
                <span className="hidden sm:inline">Day View</span>
                <span className="sm:hidden">Day</span>
              </div>
            </div>
            <div className="p-1 sm:p-2 text-center">
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                {format(currentDate, "EEEE")}
              </div>
              <div className={cn(
                "text-sm sm:text-lg font-semibold transition-colors duration-200",
                isToday(currentDate) && "text-primary"
              )}>
                {format(currentDate, "MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </div>

        {/* Time grid - show actual times */}
        <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] flex-1 relative">
          {/* Time labels - show actual times */}
          <div className="border-r relative bg-gradient-to-r from-background to-muted/20">
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="border-b border-border/30 h-12 sm:h-16 flex items-center justify-center text-xs text-muted-foreground"
              >
                <span className="hidden sm:inline">{hour.toString().padStart(2, "0")}:00</span>
                <span className="sm:hidden">{hour.toString().padStart(2, "0")}</span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="relative">
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="border-b border-border/20 h-12 sm:h-16"
              />
            ))}
            
            {/* Sample event skeletons */}
            <div className="absolute inset-2 top-2 pointer-events-none">
              <div 
                className="absolute left-0 right-0 bg-blue-100 border border-blue-200 rounded p-2 shadow-sm"
                style={{ top: `${9 * 64}px`, height: '64px' }}
              >
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-2 w-1/2" />
              </div>
              <div 
                className="absolute left-0 right-0 bg-emerald-100 border border-emerald-200 rounded p-2 shadow-sm"
                style={{ top: `${14 * 64}px`, height: '96px' }}
              >
                <Skeleton className="h-3 w-2/3 mb-1" />
                <Skeleton className="h-2 w-1/3 mb-1" />
                <Skeleton className="h-2 w-1/2" />
              </div>
              <div 
                className="absolute left-0 right-0 bg-violet-100 border border-violet-200 rounded p-2 shadow-sm"
                style={{ top: `${11 * 64}px`, height: '48px' }}
              >
                <Skeleton className="h-3 w-1/2 mb-1" />
                <Skeleton className="h-2 w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderYearSkeleton = () => {
    const year = currentDate.getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))

    return (
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((monthDate) => {
            const monthStart = startOfMonth(monthDate)
            const monthEnd = endOfMonth(monthDate)
            const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
            const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
            const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

            const weeks = []
            for (let i = 0; i < calendarDays.length; i += 7) {
              weeks.push(calendarDays.slice(i, i + 7))
            }

            return (
              <div key={monthDate.getMonth()} className="border rounded-lg p-3 bg-card hover:shadow-md transition-shadow">
                <div className="text-center mb-2">
                  <div className="text-sm font-medium">{format(monthDate, "MMMM")}</div>
                </div>
                
                {/* Mini month header */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground text-center font-medium">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Mini month grid */}
                <div className="space-y-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                      {week.map((day, dayIndex) => {
                        const isCurrentMonth = day.getMonth() === monthDate.getMonth()
                        const isCurrentDay = isToday(day)
                        
                        return (
                          <div key={dayIndex} className="relative">
                            <div className={cn(
                              "h-6 w-6 text-xs flex items-center justify-center rounded cursor-pointer hover:bg-accent transition-colors",
                              !isCurrentMonth && "text-muted-foreground/50",
                              isCurrentDay && "bg-primary text-primary-foreground font-medium"
                            )}>
                              {format(day, "d")}
                            </div>
                            {(weekIndex + dayIndex) % 4 === 0 && isCurrentMonth && (
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
                                <Skeleton className="w-1 h-1 rounded-full" />
                                <Skeleton className="w-1 h-1 rounded-full" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekSkeleton = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    return (
      <div className="flex-1 relative">
        <div className="sticky top-0 z-30 bg-background/98 supports-[backdrop-filter]:bg-background/95 border-b shadow-sm">
          <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr]">
            <div className="border-r p-1 sm:p-2 flex items-center justify-center">
              <div className="bg-primary/10 border border-primary/20 rounded px-1 sm:px-2 py-1 text-xs font-medium text-primary">
                <span className="hidden sm:inline">Week View</span>
                <span className="sm:hidden">Week</span>
              </div>
            </div>
            <div className="grid grid-cols-7">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="p-1 sm:p-2 text-center border-r last:border-r-0">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    <span className="hidden sm:inline">{format(day, "EEE")}</span>
                    <span className="sm:hidden">{format(day, "EEEEE")}</span>
                  </div>
                  <div className={cn(
                    "text-sm sm:text-lg font-semibold transition-colors duration-200",
                    isToday(day) && "text-primary"
                  )}>
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] flex-1 relative">
          <div className="border-r relative bg-gradient-to-r from-background to-muted/20">
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="border-b border-border/30 h-12 sm:h-16 flex items-center justify-center text-xs text-muted-foreground"
              >
                <span className="hidden sm:inline">{hour.toString().padStart(2, "0")}:00</span>
                <span className="sm:hidden">{hour.toString().padStart(2, "0")}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 relative">
            {weekDays.map((day, dayIndex) => (
              <div key={day.toISOString()} className="border-r border-b last:border-r-0 relative">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={hour}
                    className="border-b border-border/20 h-12 sm:h-16"
                  />
                ))}
                
                <div className="absolute inset-2 top-2 pointer-events-none">
                  {dayIndex % 3 === 0 && (
                    <div 
                      className="absolute left-0 right-0 bg-blue-100 border border-blue-200 rounded p-2 shadow-sm"
                      style={{ top: `${9 * 64}px`, height: '64px' }}
                    >
                      <Skeleton className="h-3 w-3/4 mb-1" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  )}
                  {dayIndex % 4 === 1 && (
                    <div 
                      className="absolute left-0 right-0 bg-emerald-100 border border-emerald-200 rounded p-2 shadow-sm"
                      style={{ top: `${14 * 64}px`, height: '96px' }}
                    >
                      <Skeleton className="h-3 w-2/3 mb-1" />
                      <Skeleton className="h-2 w-1/3 mb-1" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  )}
                  {dayIndex % 5 === 2 && (
                    <div 
                      className="absolute left-0 right-0 bg-violet-100 border border-violet-200 rounded p-2 shadow-sm"
                      style={{ top: `${11 * 64}px`, height: '48px' }}
                    >
                      <Skeleton className="h-3 w-1/2 mb-1" />
                      <Skeleton className="h-2 w-1/4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderMonthSkeleton = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const weeks = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }

    return (
      <div className="flex-1 flex flex-col">
        {/* Month header */}
        <div className="sticky top-0 z-30 bg-background/98 supports-[backdrop-filter]:bg-background/95 border-b shadow-sm">
          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center border-r last:border-r-0">
                <div className="text-sm font-medium text-muted-foreground">{day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex-1 grid grid-cols-7 border-b last:border-b-0">
              {week.map((day) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isCurrentDay = isToday(day)

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "border-r last:border-r-0 p-2 min-h-[120px] relative",
                      !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {(weekIndex + day.getDate()) % 3 === 0 && (
                        <>
                          <div className="bg-blue-100 border border-blue-200 rounded p-1 text-xs">
                            <Skeleton className="h-3 w-3/4 mb-1" />
                            <Skeleton className="h-2 w-1/2" />
                          </div>
                          <div className="bg-emerald-100 border border-emerald-200 rounded p-1 text-xs">
                            <Skeleton className="h-3 w-2/3 mb-1" />
                            <Skeleton className="h-2 w-1/3" />
                          </div>
                        </>
                      )}
                      {(weekIndex + day.getDate()) % 4 === 1 && (
                        <div className="bg-violet-100 border border-violet-200 rounded p-1 text-xs">
                          <Skeleton className="h-3 w-1/2 mb-1" />
                          <Skeleton className="h-2 w-1/4" />
                        </div>
                      )}
                      {(weekIndex + day.getDate()) % 5 === 2 && (
                        <div className="bg-orange-100 border border-orange-200 rounded p-1 text-xs">
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-[400px] flex flex-col">
      {/* Calendar header - show actual title and working controls */}
      <div className="sticky top-0 z-40 flex flex-col gap-2 p-2 sm:p-4 border-b bg-background/98 supports-[backdrop-filter]:bg-background/95">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-xl font-semibold">
              {(() => {
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
              })()}
            </h1>
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="ml-1 sm:ml-2 text-xs sm:text-sm px-2 sm:px-3"
              >
                Today
              </Button>
              {(view === "week" || view === "day") && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="ml-1 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center border rounded-md p-1">
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className="text-xs px-2 h-8"
              >
                Day
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="text-xs px-2 h-8"
              >
                Week
              </Button>
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="text-xs px-2 h-8"
              >
                Month
              </Button>
              <Button
                variant={view === "year" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("year")}
                className="text-xs px-2 h-8"
              >
                Year
              </Button>
            </div>

            <Button
              size="sm"
              disabled
              className="text-xs h-8 px-2 sm:px-3"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Event</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar content skeleton */}
      <div className="flex-1 min-h-0 overflow-auto">
        {view === "day" ? renderDayView() : 
         view === "month" ? renderMonthSkeleton() : 
         view === "year" ? renderYearSkeleton() : 
         renderWeekSkeleton()}
      </div>
    </div>
  )
}