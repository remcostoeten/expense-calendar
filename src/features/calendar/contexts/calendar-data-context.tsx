"use client"

import React, { createContext, useContext, ReactNode } from "react"
import type { TEvent, TCalendar } from "@/server/schema"

interface CalendarDataContextType {
  events: TEvent[]
  calendars: TCalendar[]
  userId?: number
}

const CalendarDataContext = createContext<CalendarDataContextType | undefined>(undefined)

interface CalendarDataProviderProps {
  children: ReactNode
  events: TEvent[]
  calendars: TCalendar[]
  userId?: number
}

export function CalendarDataProvider({ children, events, calendars, userId }: CalendarDataProviderProps) {
  return (
    <CalendarDataContext.Provider value={{ events, calendars, userId }}>
      {children}
    </CalendarDataContext.Provider>
  )
}

export function useCalendarData() {
  const context = useContext(CalendarDataContext)
  if (context === undefined) {
    // Return empty data if context is not available (fallback)
    return { events: [], calendars: [], userId: undefined }
  }
  return context
}