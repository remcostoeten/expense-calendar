"use client"

import { ReactNode } from "react"
import { CalendarSkeleton } from "./calendar-skeleton"
import { cn } from "@/lib/utils"

interface CalendarShellProps {
  children: ReactNode
  isLoading: boolean
  hasData: boolean
  view?: "day" | "week" | "month" | "year"
  className?: string
}

export function CalendarShell({ 
  children, 
  isLoading, 
  hasData, 
  view = "week",
  className 
}: CalendarShellProps) {
  // Show skeleton only on initial load (no data yet)
  if (isLoading && !hasData) {
    return <CalendarSkeleton initialView={view} />
  }

  // Show content with optional loading overlay for subsequent loads
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && hasData && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-background border rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Updating...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}