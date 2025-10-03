import { useState, useCallback } from "react"
import { isSameDay } from "date-fns"

type TTimeSelection = {
  date: Date
  time: number
}

export function useTimeSelection(getHourHeight: () => number) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<TTimeSelection | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<TTimeSelection | null>(null)
  const [selectionDay, setSelectionDay] = useState<Date | null>(null)

  const handleTimeSlotMouseDown = useCallback(function handleTimeSlotMouseDown(
    day: Date,
    hour: number,
    e: React.MouseEvent
  ) {
    const target = e.target as HTMLElement
    if (target.closest("[data-event-id]")) {
      return
    }

    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const hourHeight = getHourHeight()
    const minuteOffset = (relativeY / hourHeight) * 60
    const time = hour + minuteOffset / 60

    setIsSelecting(true)
    setSelectionDay(day)
    setSelectionStart({ date: day, time })
    setSelectionEnd({ date: day, time })
  }, [getHourHeight])

  const handleTimeSlotMouseMove = useCallback(function handleTimeSlotMouseMove(
    day: Date,
    hour: number,
    e: React.MouseEvent
  ) {
    if (!isSelecting || !selectionStart || !selectionDay || !isSameDay(day, selectionDay)) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const hourHeight = getHourHeight()
    const minuteOffset = (relativeY / hourHeight) * 60
    const time = hour + minuteOffset / 60

    setSelectionEnd({ date: day, time })
  }, [isSelecting, selectionStart, selectionDay, getHourHeight])

  const handleTimeSlotMouseUp = useCallback(function handleTimeSlotMouseUp(): { start: Date; end: Date } | null {
    if (!isSelecting || !selectionStart || !selectionEnd) {
      return null
    }

    const startTime = Math.min(selectionStart.time, selectionEnd.time)
    const endTime = Math.max(selectionStart.time, selectionEnd.time)

    const minDuration = 0.5
    const duration = endTime - startTime

    let start: Date
    let end: Date

    if (duration < minDuration) {
      start = new Date(selectionStart.date)
      start.setHours(Math.floor(startTime), (startTime % 1) * 60, 0, 0)
      end = new Date(start)
      end.setHours(start.getHours() + 1)
    } else {
      start = new Date(selectionStart.date)
      start.setHours(Math.floor(startTime), (startTime % 1) * 60, 0, 0)
      end = new Date(selectionEnd.date)
      end.setHours(Math.floor(endTime), (endTime % 1) * 60, 0, 0)
    }

    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
    setSelectionDay(null)

    return { start, end }
  }, [isSelecting, selectionStart, selectionEnd])

  const clearSelection = useCallback(function clearSelection() {
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
    setSelectionDay(null)
  }, [])

  return {
    isSelecting,
    selectionStart,
    selectionEnd,
    selectionDay,
    handleTimeSlotMouseDown,
    handleTimeSlotMouseMove,
    handleTimeSlotMouseUp,
    clearSelection,
  }
}