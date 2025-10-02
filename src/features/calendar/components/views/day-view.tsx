import { format, isSameDay } from "date-fns"
import type { RefObject } from "react"
import { cn } from "@/lib/utils"
import { TimeColumn } from "../time-column"
import { EventCard } from "../event-card"
import { CurrentTimeIndicator } from "../current-time-indicator"
import type { TCalendarEvent } from "../event-calendar"
import { getEventsForDay } from "../../utils/calendar-utils"

type TProps = {
    currentDate: Date
    events: TCalendarEvent[]
    onEventClick: (event: TCalendarEvent) => void
    currentTime: Date
    showCurrentTime: boolean
    scrollContainerRef: RefObject<HTMLDivElement>
    calendarContentRef: RefObject<HTMLDivElement>
    dragAndDrop: {
        isDragging: boolean
        isResizing: boolean
        draggedEvent: TCalendarEvent | null
        handleEventMouseDown: (event: TCalendarEvent, e: React.MouseEvent, handle?: 'top' | 'bottom') => void
    }
    timeSelection: {
        isSelecting: boolean
        selectionStart: { date: Date; time: number } | null
        selectionEnd: { date: Date; time: number } | null
        selectionDay: Date | null
        handleTimeSlotMouseDown: (day: Date, hour: number, e: React.MouseEvent) => void
        handleTimeSlotMouseMove: (day: Date, hour: number, e: React.MouseEvent) => void
        handleTimeSlotMouseUp: () => { start: Date; end: Date } | null
    }
    onCellClick?: (date: Date, timeHour?: number, endDate?: Date) => void
    zoom: {
        zoomLevel: number
        getHourHeight: () => number
        handleZoomStart: (e: React.MouseEvent) => void
    }
}

export function DayView({
    currentDate,
    events,
    onEventClick,
    currentTime,
    showCurrentTime,
    scrollContainerRef,
    calendarContentRef,
    dragAndDrop,
    timeSelection,
    zoom,
    onCellClick,
}: TProps) {
    const dayEvents = getEventsForDay(events, currentDate)
    const hourHeight = zoom.getHourHeight()

    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimePosition = (currentHour + currentMinute / 60) * hourHeight

    return (
        <div className="flex-1 flex flex-col relative">
            <div className="sticky top-0 z-30 bg-background border-b shadow-sm">
                <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr]">
                    <div className="border-r p-1 sm:p-2 flex items-center justify-center bg-background">
                        <div className="bg-primary/10 border border-primary/20 rounded px-1 sm:px-2 py-1 text-xs font-medium text-primary">
                            <span className="hidden sm:inline">Day View</span>
                            <span className="sm:hidden">Day</span>
                        </div>
                    </div>
                    <div className="p-1 sm:p-2 text-center bg-background">
                        <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                            {format(currentDate, "EEEE")}
                        </div>
                        <div
                            className={cn(
                                "text-sm sm:text-lg font-semibold transition-colors duration-200",
                                isSameDay(currentDate, new Date()) && "text-primary",
                            )}
                        >
                            {format(currentDate, "MMMM d, yyyy")}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    className="h-full overflow-y-auto overflow-x-hidden"
                >
                    <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] relative">
                        <TimeColumn
                            hourHeight={hourHeight}
                            onZoomStart={zoom.handleZoomStart}
                            zoomLevel={zoom.zoomLevel}
                        />

                        <div className="relative" ref={calendarContentRef}>
                            {showCurrentTime && isSameDay(currentDate, new Date()) && (
                                <CurrentTimeIndicator
                                    currentTime={currentTime}
                                    position={currentTimePosition}
                                />
                            )}

                            {Array.from({ length: 24 }, (_, hour) => (
                                <div
                                    key={hour}
                                    className="border-b border-border/20 hover:bg-accent/30 transition-colors duration-150 cursor-pointer"
                                    style={{ height: `${hourHeight}px` }}
                                    onMouseDown={(e) => timeSelection.handleTimeSlotMouseDown(currentDate, hour, e)}
                                    onMouseMove={(e) => timeSelection.handleTimeSlotMouseMove(currentDate, hour, e)}
                                    onMouseUp={() => {
                                      const result = timeSelection.handleTimeSlotMouseUp()
                                      if (result && onCellClick) {
                                        const startHour = result.start.getHours() + result.start.getMinutes() / 60
                                        onCellClick(result.start, startHour, result.end)
                                      }
                                    }}
                                />
                            ))}

                            {timeSelection.isSelecting &&
                                timeSelection.selectionStart &&
                                timeSelection.selectionEnd &&
                                timeSelection.selectionDay &&
                                isSameDay(currentDate, timeSelection.selectionDay) && (
                                    <div
                                        className="absolute left-2 right-2 bg-primary/20 border-2 border-primary rounded pointer-events-none z-10"
                                        style={{
                                            top: `${Math.min(timeSelection.selectionStart.time, timeSelection.selectionEnd.time) * hourHeight}px`,
                                            height: `${Math.abs(timeSelection.selectionEnd.time - timeSelection.selectionStart.time) * hourHeight}px`,
                                        }}
                                    >
                                        <div className="flex items-center justify-center h-full text-xs font-medium text-primary">
                                            New Event
                                        </div>
                                    </div>
                                )}

                            <div className="absolute inset-2 top-2 pointer-events-none">
                                {dayEvents.map((event) => {
                                    const currentEvent = dragAndDrop.draggedEvent?.id === event.id
                                        ? dragAndDrop.draggedEvent
                                        : event

                                    const startHour = currentEvent.start.getHours()
                                    const startMinute = currentEvent.start.getMinutes()
                                    const duration = (currentEvent.end.getTime() - currentEvent.start.getTime()) / (1000 * 60 * 60)
                                    const top = (startHour + startMinute / 60) * hourHeight
                                    const height = Math.max(duration * hourHeight, Math.min(24, hourHeight * 0.5))

                                    return (
                                        <EventCard
                                            key={event.id}
                                            event={currentEvent}
                                            top={top}
                                            height={height}
                                            hourHeight={hourHeight}
                                            isBeingDragged={dragAndDrop.draggedEvent?.id === event.id}
                                            onMouseDown={dragAndDrop.handleEventMouseDown}
                                            onClick={(e, evt) => {
                                                evt.stopPropagation()
                                                onEventClick(e)
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
