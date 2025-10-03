"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, addDays, subDays } from "date-fns"
import { useCalendarStore } from "@/stores/calendar-store"
import { EventCreationModal } from "./event-creation-modal"
import { EventEditModal } from "./event-edit-modal"
import { DayView } from "./views/day-view"
import { WeekView } from "./views/week-view"
import { MonthView } from "./views/month-view"
import { YearView } from "./views/year-view"
import { useCurrentTime } from "@/hooks/use-current-time"
import { useZoom } from "@/hooks/use-zoom"
import { useTimeSelection } from "@/hooks/use-time-selection"
import { useEventDragAndDrop } from "@/hooks/use-event-drag-drop"
import { CalendarHeader } from "./calendar-header"
import { useCalendarData } from "../contexts/calendar-data-context"
import { CalendarCreationModal } from "./calendar-creation-modal"

export type TCalendarEvent = {
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

type TCalendarView = "day" | "week" | "month" | "year"

type TProps = {
  events: TCalendarEvent[]
  onEventAdd?: (event: TCalendarEvent) => void
  onEventUpdate?: (event: TCalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  initialView?: TCalendarView
  userId?: number
  onCalendarCreated?: () => void
}

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
  const [view, setView] = useState<TCalendarView>(initialView)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isCreateCalendarOpen, setIsCreateCalendarOpen] = useState(false)
  const [eventCreationStart, setEventCreationStart] = useState<Date>(new Date())
  const [eventCreationEnd, setEventCreationEnd] = useState<Date>(new Date())
  const { calendars } = useCalendarData()
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TCalendarEvent | null>(null)

  const calendarContentRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const currentTime = useCurrentTime(showCurrentTime)
  const zoom = useZoom()
  const timeSelection = useTimeSelection(zoom.getHourHeight)
  const dragAndDrop = useEventDragAndDrop({
    view,
    currentDate,
    getHourHeight: zoom.getHourHeight,
    calendarContentRef,
    onEventUpdate,
  })

  const navigate = useCallback(
    function navigate(direction: "prev" | "next") {
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

  const jumpToCurrentTime = useCallback(function jumpToCurrentTime() {
    if (!scrollContainerRef.current) return

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInHours = currentHour + currentMinute / 60

    const hourHeight = window.innerWidth >= 640 ? 64 : 48
    const scrollPosition = currentTimeInHours * hourHeight

    scrollContainerRef.current.scrollTo({
      top: Math.max(0, scrollPosition - 200),
      behavior: 'smooth'
    })
  }, [])

  useEffect(function autoScrollToCurrentTime() {
    const timer = setTimeout(() => {
      jumpToCurrentTime()
    }, 100)

    return () => clearTimeout(timer)
  }, [jumpToCurrentTime])

  const handleCellClick = useCallback(function handleCellClick(date: Date, timeHour?: number, endDate?: Date) {
    const start = timeHour !== undefined
      ? (() => {
        const s = new Date(date)
        s.setHours(Math.floor(timeHour), (timeHour % 1) * 60, 0, 0)
        return s
      })()
      : new Date(date.setHours(0, 0, 0, 0))

    const end = endDate || (timeHour !== undefined
      ? new Date(start.getTime() + 60 * 60 * 1000)
      : new Date(date.setHours(23, 59, 59, 999)))

    setEventCreationStart(start)
    setEventCreationEnd(end)
    setIsCreatingEvent(true)
  }, [])

  const handleEventCreate = useCallback(function handleEventCreate(eventData: Omit<TCalendarEvent, "id">) {
    const newEvent: TCalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    }
    onEventAdd?.(newEvent)
  }, [onEventAdd])

  const handleEventClick = useCallback(function handleEventClick(event: TCalendarEvent) {
    if (dragAndDrop.justFinishedDragging || dragAndDrop.isDragging || dragAndDrop.isResizing) {
      return
    }

    setEditingEvent(event)
    setIsEditingEvent(true)
  }, [dragAndDrop.justFinishedDragging, dragAndDrop.isDragging, dragAndDrop.isResizing])

  const handleEventDelete = useCallback(function handleEventDelete(eventId: string) {
    onEventDelete?.(eventId)
  }, [onEventDelete])

  const renderCurrentView = useCallback(function renderCurrentView() {
    const sharedProps = {
      currentDate,
      events,
      onEventClick: handleEventClick,
      currentTime,
      showCurrentTime,
      scrollContainerRef,
      calendarContentRef,
    }

    switch (view) {
      case "day":
        return (
          <DayView
            {...sharedProps}
            dragAndDrop={dragAndDrop}
            timeSelection={timeSelection}
            zoom={zoom}
            onCellClick={handleCellClick}
          />
        )
      case "week":
        return (
          <WeekView
            {...sharedProps}
            dragAndDrop={dragAndDrop}
            timeSelection={timeSelection}
            zoom={zoom}
            onCellClick={handleCellClick}
          />
        )
      case "month":
        return (
          <MonthView
            {...sharedProps}
            onCellClick={handleCellClick}
          />
        )
      case "year":
        return (
          <YearView
            {...sharedProps}
            onCellClick={(date) => {
              setCurrentDate(date)
              setView("day")
            }}
          />
        )
      default:
        return null
    }
  }, [view, currentDate, events, handleEventClick, currentTime, showCurrentTime, dragAndDrop, timeSelection, zoom, handleCellClick, setCurrentDate])

  return (
    <>
      <div className="h-full min-h-[400px] flex flex-col">
        <CalendarHeader
          view={view}
          currentDate={currentDate}
          onViewChange={setView}
          onNavigate={navigate}
          onTodayClick={() => setCurrentDate(new Date())}
          onJumpToCurrentTime={jumpToCurrentTime}
          onAddEvent={() => {
            if (!calendars || calendars.length === 0) {
              setIsCreateCalendarOpen(true)
              return
            }
            const now = new Date()
            setEventCreationStart(now)
            setEventCreationEnd(new Date(now.getTime() + 60 * 60 * 1000))
            setIsCreatingEvent(true)
          }}
        />

        <div
          id="calendar-content"
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

      <CalendarCreationModal
        isOpen={isCreateCalendarOpen}
        onClose={() => setIsCreateCalendarOpen(false)}
        onSuccess={() => setIsCreateCalendarOpen(false)}
        userId={userId?.toString() || ""}
        onCalendarCreated={onCalendarCreated}
      />

      <EventEditModal
        isOpen={isEditingEvent}
        onClose={() => {
          setIsEditingEvent(false)
          setEditingEvent(null)
        }}
        onSave={onEventUpdate || (() => { })}
        onDelete={handleEventDelete}
        event={editingEvent}
      />
    </>
  )
}