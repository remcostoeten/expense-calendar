"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfDay,
  endOfDay,
  isWithinInterval,
  isSameDay,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react"
import { RiRepeatLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useCalendarStore } from "@/stores/calendar-store"
import { EventCreationModal } from "./event-creation-modal"
import { EventEditModal } from "./event-edit-modal"

export interface TCalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  color: string
  location?: string
  allDay?: boolean
  isRecurring?: boolean
  recurrenceRule?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly"
    interval: number
    endDate?: Date
    count?: number
  }
}

type TProps = {
  events: TCalendarEvent[]
  onEventAdd?: (event: TCalendarEvent) => void
  onEventUpdate?: (event: TCalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  initialView?: "day" | "week" | "month" | "year"
  userId?: number
  onCalendarCreated?: () => void
}

type CalendarView = "day" | "week" | "month" | "year"

export function EventCalendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  initialView = "week",
  userId,
  onCalendarCreated,
}: TProps) {
  const { currentDate, setCurrentDate, showCurrentTime } = useCalendarStore()
  const [view, setView] = useState<CalendarView>(initialView)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [eventCreationStart, setEventCreationStart] = useState<Date>(new Date())
  const [eventCreationEnd, setEventCreationEnd] = useState<Date>(new Date())
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{ date: Date; time: number } | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<{ date: Date; time: number } | null>(null)
  const [selectionDay, setSelectionDay] = useState<Date | null>(null)
  const calendarContentRef = useRef<HTMLDivElement>(null)

  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TCalendarEvent | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (!showCurrentTime) return

    const updateCurrentTime = () => {
      setCurrentTime(new Date())
    }

    // Update immediately
    updateCurrentTime()

    // Set up interval to update every minute
    const interval = setInterval(updateCurrentTime, 60000)

    return () => clearInterval(interval)
  }, [showCurrentTime])

  const jumpToCurrentTime = useCallback(() => {
    if (!calendarContentRef.current) return

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInHours = currentHour + currentMinute / 60

    // Calculate the scroll position (responsive height per hour)
    const hourHeight = window.innerWidth >= 640 ? 64 : 48
    const scrollPosition = currentTimeInHours * hourHeight

    // Scroll to current time with smooth animation
    calendarContentRef.current.scrollTo({
      top: scrollPosition - 100, // Offset to show some context above current time
      behavior: 'smooth'
    })
  }, [])



  const handleCellClick = (date: Date, timeHour?: number, e?: React.MouseEvent) => {
    // Check if clicking on an existing event
    if (e) {
      const target = e.target as HTMLElement
      if (target.closest("[data-event-id]")) {
        return // Don't create new event if clicking on existing event
      }
    }

    if (view === "month" || view === "year") {
      // For month/year view, create all-day event
      const start = startOfDay(date)
      const end = endOfDay(date)
      setEventCreationStart(start)
      setEventCreationEnd(end)
      setIsCreatingEvent(true)
    } else if (timeHour !== undefined) {
      // For day/week view, create 1-hour event at clicked time
      const start = new Date(date)
      start.setHours(Math.floor(timeHour), (timeHour % 1) * 60, 0, 0)
      const end = new Date(start)
      end.setHours(start.getHours() + 1)
      setEventCreationStart(start)
      setEventCreationEnd(end)
      setIsCreatingEvent(true)
    }
  }

  const handleEventCreate = (eventData: Omit<TCalendarEvent, "id">) => {
    const newEvent: TCalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    }
    onEventAdd?.(newEvent)
  }

  const handleEventClick = (event: TCalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingEvent(event)
    setIsEditingEvent(true)
  }

  const handleEventUpdate = (updatedEvent: TCalendarEvent) => {
    onEventUpdate?.(updatedEvent)
  }

  const handleEventDelete = (eventId: string) => {
    onEventDelete?.(eventId)
  }

  const navigate = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate(
        (() => {
          switch (view) {
            case "day":
              return direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1)
            case "week":
              return direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1)
            case "month":
              return direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1)
            case "year":
              return direction === "next" ? addYears(currentDate, 1) : subYears(currentDate, 1)
            default:
              return currentDate
          }
        })(),
      )
    },
    [view, currentDate, setCurrentDate],
  )

  const getEventsForDay = useCallback(
    (day: Date) => {
      return events.filter((event) => {
        const eventStart = startOfDay(event.start)
        const eventEnd = endOfDay(event.end)
        const dayStart = startOfDay(day)
        const dayEnd = endOfDay(day)

        return (
          isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
          isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
          isWithinInterval(eventStart, { start: dayStart, end: dayEnd })
        )
      })
    },
    [events],
  )

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200",
      emerald:
        "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-200",
      orange:
        "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-200",
      violet:
        "bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-200",
      rose: "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200",
    }
    return (
      colorMap[color] ||
      "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
    )
  }

  const getViewTitle = () => {
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

  const handleTimeSlotMouseDown = (day: Date, hour: number, e: React.MouseEvent) => {
    // Check if clicking on an existing event
    const target = e.target as HTMLElement
    if (target.closest("[data-event-id]")) {
      return
    }

    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const hourHeight = window.innerWidth >= 640 ? 64 : 48 // Responsive height
    const minuteOffset = (relativeY / hourHeight) * 60
    const time = hour + minuteOffset / 60

    setIsSelecting(true)
    setSelectionDay(day)
    setSelectionStart({ date: day, time })
    setSelectionEnd({ date: day, time })
  }

  const handleTimeSlotMouseMove = (day: Date, hour: number, e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !isSameDay(day, selectionDay!)) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const hourHeight = window.innerWidth >= 640 ? 64 : 48 // Responsive height
    const minuteOffset = (relativeY / hourHeight) * 60
    const time = hour + minuteOffset / 60

    setSelectionEnd({ date: day, time })
  }

  const handleTimeSlotMouseUp = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) {
      return
    }

    const startTime = Math.min(selectionStart.time, selectionEnd.time)
    const endTime = Math.max(selectionStart.time, selectionEnd.time)

    // Minimum 30 minute selection
    const minDuration = 0.5 // 30 minutes
    const duration = endTime - startTime

    if (duration < minDuration) {
      // If selection is too small, create a 1-hour event
      const start = new Date(selectionStart.date)
      start.setHours(Math.floor(startTime), (startTime % 1) * 60, 0, 0)
      const end = new Date(start)
      end.setHours(start.getHours() + 1)

      setEventCreationStart(start)
      setEventCreationEnd(end)
    } else {
      const start = new Date(selectionStart.date)
      start.setHours(Math.floor(startTime), (startTime % 1) * 60, 0, 0)
      const end = new Date(selectionEnd.date)
      end.setHours(Math.floor(endTime), (endTime % 1) * 60, 0, 0)

      setEventCreationStart(start)
      setEventCreationEnd(end)
    }

    setIsCreatingEvent(true)
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
    setSelectionDay(null)
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // Calculate current time position for the red line (responsive height)
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const hourHeight = window.innerWidth >= 640 ? 64 : 48 // 64px on sm+, 48px on mobile
    const currentTimePosition = (currentHour + currentMinute / 60) * hourHeight

    return (
      <div className="flex-1 relative">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b shadow-sm">
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
                  <div
                    className={cn(
                      "text-sm sm:text-lg font-semibold transition-colors duration-200",
                      isSameDay(day, new Date()) && "text-primary",
                    )}
                  >
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
            {/* Current time line - spans across all days */}
            {showCurrentTime && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                {/* Subtle time indicator */}
                <div className="flex items-center relative">
                  {/* Time label - more subtle styling */}
                  <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-red-500/90 text-white text-xs px-1.5 py-0.5 rounded font-medium shadow-sm whitespace-nowrap z-20">
                    {format(currentTime, "HH:mm")}
                  </div>
                  {/* Main line - simplified and less prominent */}
                  <div className="w-full relative">
                    <div className="h-px bg-red-500/80 shadow-sm" />
                    {/* Simple dot indicator */}
                    <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {weekDays.map((day) => {
              const dayEvents = getEventsForDay(day)
              return (
                <div key={day.toISOString()} className="border-r border-b last:border-r-0 relative">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      className="border-b border-border/20 hover:bg-accent/30 transition-colors duration-150 h-12 sm:h-16 cursor-pointer"
                      onMouseDown={(e) => handleTimeSlotMouseDown(day, hour, e)}
                      onMouseMove={(e) => handleTimeSlotMouseMove(day, hour, e)}
                      onMouseUp={handleTimeSlotMouseUp}
                    />
                  ))}

                  {isSelecting && selectionStart && selectionEnd && isSameDay(day, selectionDay!) && (
                    <div
                      className="absolute left-2 right-2 bg-primary/20 border-2 border-primary rounded pointer-events-none z-10"
                      style={{
                        top: `${Math.min(selectionStart.time, selectionEnd.time) * (window.innerWidth >= 640 ? 64 : 48)}px`,
                        height: `${Math.abs(selectionEnd.time - selectionStart.time) * (window.innerWidth >= 640 ? 64 : 48)}px`,
                      }}
                    >
                      <div className="flex items-center justify-center h-full text-xs font-medium text-primary">
                        New Event
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-2 top-2 pointer-events-none">
                    {dayEvents.map((event) => {
                      const startHour = event.start.getHours()
                      const startMinute = event.start.getMinutes()
                      const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
                      const hourHeight = window.innerWidth >= 640 ? 64 : 48 // Responsive height
                      const top = (startHour + startMinute / 60) * hourHeight
                      const height = Math.max(duration * hourHeight, 24) // Minimum height responsive too

                      return (
                        <Card
                          key={event.id}
                          data-event-id={event.id}
                          className={cn(
                            "absolute left-0 right-0 text-xs border transition-all duration-200 hover:shadow-md cursor-pointer pointer-events-auto p-2",
                            getColorClasses(event.color),
                          )}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <CardContent className="p-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate flex-1">{event.title}</div>
                              {event.isRecurring && <RiRepeatLine className="h-3 w-3 opacity-75 ml-1 flex-shrink-0" />}
                            </div>
                            <div className="text-xs opacity-75">
                              {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                            </div>
                            {event.location && <div className="text-xs opacity-75 truncate">{event.location}</div>}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
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
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b shadow-sm">
          <div className="grid grid-cols-7">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center border-r last:border-r-0">
                <div className="text-sm font-medium text-muted-foreground">{day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Month grid */}
        <div className="flex-1 flex flex-col">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex-1 grid grid-cols-7 border-b last:border-b-0">
              {week.map((day) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isCurrentDay = isToday(day)

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "border-r last:border-r-0 p-2 min-h-[120px] cursor-pointer hover:bg-accent/30 transition-colors relative",
                      !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                    )}
                    onClick={(e) => handleCellClick(day, undefined, e)}
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
                      {/* Current time indicator for today in month view */}
                      {showCurrentTime && isCurrentDay && (
                        <div className="absolute top-1 right-1 flex items-center gap-1 bg-red-500/80 text-white px-1.5 py-0.5 rounded shadow-sm">
                          <div className="w-1 h-1 bg-white/80 rounded-full" />
                          <span className="text-xs font-medium leading-none">
                            {format(currentTime, "HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          data-event-id={event.id}
                          className={cn(
                            "text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-all",
                            getColorClasses(event.color)
                          )}
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          <div className="flex items-center gap-1">
                            <div className="font-medium truncate flex-1">{event.title}</div>
                            {event.isRecurring && <RiRepeatLine className="h-3 w-3 opacity-75 flex-shrink-0" />}
                          </div>
                          {!event.allDay && (
                            <div className="text-xs opacity-75">
                              {format(event.start, "HH:mm")}
                            </div>
                          )}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground font-medium">
                          +{dayEvents.length - 3} more
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

  const renderCurrentView = () => {
    switch (view) {
      case "month":
        return renderMonthView()
      case "week":
      default:
        return renderWeekView()
    }
  }

  return (
    <>
      <div className="h-full min-h-[400px] flex flex-col">
        <div className="sticky top-0 z-40 flex flex-col gap-2 p-2 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold transition-all duration-300 truncate">{getViewTitle()}</h2>
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("prev")}
                  className="transition-all duration-200 hover:scale-105 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                  aria-label={`Previous ${view}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("next")}
                  className="transition-all duration-200 hover:scale-105 h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
                  aria-label={`Next ${view}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="ml-1 sm:ml-2 transition-all duration-200 hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
                >
                  Today
                </Button>
                {view === "week" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={jumpToCurrentTime}
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
                {([view === "week" ? "week" : "day", "month"] as CalendarView[]).map((viewOption) => (
                  <Button
                    key={viewOption}
                    variant={view === viewOption ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView(viewOption)}
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
                onClick={() => {
                  const now = new Date()
                  setEventCreationStart(now)
                  setEventCreationEnd(new Date(now.getTime() + 60 * 60 * 1000))
                  setIsCreatingEvent(true)
                }}
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Event</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div
          id="calendar-content"
          ref={calendarContentRef}
          className="flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out"
          role="tabpanel"
          aria-labelledby="calendar-header"
        >
          {renderCurrentView()}
        </div>
      </div>

      <EventCreationModal
        isOpen={isCreatingEvent}
        onClose={() => setIsCreatingEvent(false)}
        onSave={handleEventCreate}
        initialStart={eventCreationStart}
        initialEnd={eventCreationEnd}
        userId={userId}
        onCalendarCreated={onCalendarCreated}
      />

      <EventEditModal
        isOpen={isEditingEvent}
        onClose={() => {
          setIsEditingEvent(false)
          setEditingEvent(null)
        }}
        onSave={handleEventUpdate}
        onDelete={handleEventDelete}
        event={editingEvent}
      />
    </>
  )
}
