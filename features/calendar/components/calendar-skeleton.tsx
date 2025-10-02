"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"

type TProps = {
    initialView?: "week" | "month"
}

export function CalendarSkeleton({ initialView = "week" }: TProps) {
  const [view, setView] = useState<"week" | "month">(initialView)
  const renderWeekSkeleton = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => i)
    
    return (
      <div className="flex-1 relative">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b shadow-sm">
          <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr]">
            <div className="border-r p-1 sm:p-2 flex items-center justify-center">
              <Skeleton className="h-6 w-12 sm:w-16" />
            </div>
            <div className="grid grid-cols-7">
              {weekDays.map((day) => (
                <div key={day} className="p-1 sm:p-2 text-center border-r last:border-r-0">
                  <Skeleton className="h-4 w-8 mx-auto mb-1" />
                  <Skeleton className="h-6 w-6 mx-auto" />
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
                className="border-b border-border/30 h-12 sm:h-16 flex items-center justify-center"
              >
                <Skeleton className="h-3 w-8 sm:w-12" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 relative">
            {weekDays.map((day) => (
              <div key={day} className="border-r border-b last:border-r-0 relative">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div
                    key={hour}
                    className="border-b border-border/20 h-12 sm:h-16"
                  />
                ))}
                
                <div className="absolute inset-2 top-2 pointer-events-none">
                  {day % 3 === 0 && (
                    <div 
                      className="absolute left-0 right-0 bg-blue-100 border border-blue-200 rounded p-2 shadow-sm"
                      style={{ top: `${9 * 64}px`, height: '64px' }}
                    >
                      <Skeleton className="h-3 w-3/4 mb-1" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  )}
                  {day % 4 === 1 && (
                    <div 
                      className="absolute left-0 right-0 bg-emerald-100 border border-emerald-200 rounded p-2 shadow-sm"
                      style={{ top: `${14 * 64}px`, height: '96px' }}
                    >
                      <Skeleton className="h-3 w-2/3 mb-1" />
                      <Skeleton className="h-2 w-1/3 mb-1" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  )}
                  {day % 5 === 2 && (
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
    const weeks = Array.from({ length: 6 }, (_, i) => i)
    const days = Array.from({ length: 7 }, (_, i) => i)

    return (
      <div className="flex-1 flex flex-col">
        {/* Month header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b shadow-sm">
          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center border-r last:border-r-0">
                <div className="text-sm font-medium text-muted-foreground">{day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {weeks.map((week) => (
            <div key={week} className="flex-1 grid grid-cols-7 border-b last:border-b-0">
              {days.map((day) => (
                <div
                  key={day}
                  className="border-r last:border-r-0 p-2 min-h-[120px] relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>

                  <div className="space-y-1">
                    {(week + day) % 3 === 0 && (
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
                    {(week + day) % 4 === 1 && (
                      <div className="bg-violet-100 border border-violet-200 rounded p-1 text-xs">
                        <Skeleton className="h-3 w-1/2 mb-1" />
                        <Skeleton className="h-2 w-1/4" />
                      </div>
                    )}
                    {(week + day) % 5 === 2 && (
                      <div className="bg-orange-100 border border-orange-200 rounded p-1 text-xs">
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-[400px] flex flex-col">
      {/* Calendar header skeleton */}
      <div className="sticky top-0 z-40 flex flex-col gap-2 p-2 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Skeleton className="h-6 w-48 sm:w-64" />
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
              {view === "week" && (
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
        {view === "month" ? renderMonthSkeleton() : renderWeekSkeleton()}
      </div>
    </div>
  )
}