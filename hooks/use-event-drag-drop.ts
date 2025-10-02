import { useState, useCallback, useEffect, type RefObject } from "react"
import { startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import type { TCalendarEvent } from "../event-calendar"

type TProps = {
  view: "day" | "week" | "month" | "year"
  currentDate: Date
  getHourHeight: () => number
  calendarContentRef: RefObject<HTMLDivElement>
  onEventUpdate?: (event: TCalendarEvent) => void
}

export function useEventDragAndDrop({
  view,
  currentDate,
  getHourHeight,
  calendarContentRef,
  onEventUpdate,
}: TProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<TCalendarEvent | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<'top' | 'bottom' | null>(null)
  const [originalEventData, setOriginalEventData] = useState<{ start: Date; end: Date } | null>(null)
  const [justFinishedDragging, setJustFinishedDragging] = useState(false)

  const handleEventMouseDown = useCallback(function handleEventMouseDown(
    event: TCalendarEvent,
    e: React.MouseEvent,
    handle?: 'top' | 'bottom'
  ) {
    e.stopPropagation()

    if (handle) {
      setIsResizing(true)
      setResizeHandle(handle)
      setDraggedEvent(event)
      setOriginalEventData({ start: event.start, end: event.end })
    } else {
      setIsDragging(true)
      setDraggedEvent(event)
      setOriginalEventData({ start: event.start, end: event.end })

      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [])

  const handleMouseMove = useCallback(function handleMouseMove(e: MouseEvent) {
    if (!draggedEvent || (!isDragging && !isResizing) || !originalEventData) return

    const hourHeight = getHourHeight()

    if (isResizing && resizeHandle) {
      const calendarRect = calendarContentRef.current?.getBoundingClientRect()
      if (!calendarRect) return

      const relativeY = e.clientY - calendarRect.top
      const timeFromTop = relativeY / hourHeight
      const newTime = Math.max(0, Math.min(24, timeFromTop))

      let newStart = originalEventData.start
      let newEnd = originalEventData.end

      if (resizeHandle === 'top') {
        const newStartTime = new Date(originalEventData.start)
        newStartTime.setHours(Math.floor(newTime), (newTime % 1) * 60, 0, 0)

        if (newStartTime < originalEventData.end) {
          newStart = newStartTime
        }
      } else if (resizeHandle === 'bottom') {
        const newEndTime = new Date(originalEventData.end)
        newEndTime.setHours(Math.floor(newTime), (newTime % 1) * 60, 0, 0)

        if (newEndTime > originalEventData.start) {
          newEnd = newEndTime
        }
      }

      setDraggedEvent({ ...draggedEvent, start: newStart, end: newEnd })

    } else if (isDragging) {
      const calendarRect = calendarContentRef.current?.getBoundingClientRect()
      if (!calendarRect) return

      const relativeY = e.clientY - calendarRect.top - dragOffset.y
      const relativeX = e.clientX - calendarRect.left
      const timeFromTop = relativeY / hourHeight
      const newTime = Math.max(0, Math.min(24, timeFromTop))

      const duration = originalEventData.end.getTime() - originalEventData.start.getTime()

      let targetDate = originalEventData.start
      if (view === 'week') {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate, { weekStartsOn: 0 }) })

        const timeColumnWidth = window.innerWidth >= 640 ? 80 : 60
        const dayColumnWidth = (calendarRect.width - timeColumnWidth) / 7
        const dayIndex = Math.floor((relativeX - timeColumnWidth) / dayColumnWidth)

        if (dayIndex >= 0 && dayIndex < weekDays.length) {
          targetDate = weekDays[dayIndex]
        }
      }

      const newStart = new Date(targetDate)
      newStart.setHours(Math.floor(newTime), (newTime % 1) * 60, 0, 0)

      const newEnd = new Date(newStart.getTime() + duration)

      setDraggedEvent({ ...draggedEvent, start: newStart, end: newEnd })
    }
  }, [isDragging, isResizing, draggedEvent, resizeHandle, originalEventData, dragOffset, getHourHeight, calendarContentRef, view, currentDate])

  const handleMouseUp = useCallback(function handleMouseUp() {
    const wasDraggingOrResizing = isDragging || isResizing

    if (draggedEvent && originalEventData && wasDraggingOrResizing) {
      const startChanged = draggedEvent.start.getTime() !== originalEventData.start.getTime()
      const endChanged = draggedEvent.end.getTime() !== originalEventData.end.getTime()

      if (startChanged || endChanged) {
        onEventUpdate?.({
          ...draggedEvent,
          start: draggedEvent.start,
          end: draggedEvent.end
        })
      }
    }

    setIsDragging(false)
    setIsResizing(false)
    setDraggedEvent(null)
    setDragOffset({ x: 0, y: 0 })
    setResizeHandle(null)
    setOriginalEventData(null)

    if (wasDraggingOrResizing) {
      setJustFinishedDragging(true)
      setTimeout(() => setJustFinishedDragging(false), 100)
    }
  }, [isDragging, isResizing, draggedEvent, originalEventData, onEventUpdate])

  useEffect(function addDragListeners() {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      document.body.style.userSelect = 'none'
      document.body.style.cursor = isDragging ? 'move' : isResizing ? (resizeHandle === 'top' ? 'n-resize' : 's-resize') : 'default'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }
  }, [isDragging, isResizing, resizeHandle, handleMouseMove, handleMouseUp])

  return {
    isDragging,
    isResizing,
    draggedEvent,
    justFinishedDragging,
    handleEventMouseDown,
  }
}