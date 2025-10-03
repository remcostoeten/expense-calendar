"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

type TProps = {
  children: ReactNode
  isLoading: boolean
  hasData: boolean
  view?: "day" | "week" | "month" | "year"
  className?: string
  currentDate?: Date
}

export function CalendarShell({ 
  children, 
  isLoading, 
  hasData, 
  view = "week",
  className,
  currentDate = new Date()
}: TProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-200">
          <div className="bg-background border rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}