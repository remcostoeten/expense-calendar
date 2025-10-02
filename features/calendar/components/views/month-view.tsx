import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns"
import { RiRepeatLine } from "@remixicon/react"
import { cn } from "@/lib/utils"
import type { TCalendarEvent } from "../event-calendar"
import { getEventsForDay, getColorClasses } from "../../utils/calendar-utils"

type TProps = {
    currentDate: Date
    events: TCalendarEvent[]
    onEventClick: (event: TCalendarEvent) => void
    onCellClick: (date: Date, timeHour?: number) => void
    currentTime: Date
    showCurrentTime: boolean
}

export function MonthView({
    currentDate,
    events,
    onEventClick,
    onCellClick,
    currentTime,
    showCurrentTime,
}: TProps) {
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
            <div className="bg-background border-b shadow-sm">
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
                            const dayEvents = getEventsForDay(events, day)
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                            const isCurrentDay = isToday(day)
                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "border-r last:border-r-0 p-2 min-h-[120px] cursor-pointer hover:bg-accent/30 transition-colors relative",
                                        !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                                    )}
                                    onClick={() => onCellClick(day)}
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
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onEventClick(event)
                                                }}
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
