import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import type { TCalendarEvent } from "../event-calendar"
import { getEventsForDay } from "../../utils/calendar-utils"

type TProps = {
    currentDate: Date
    events: TCalendarEvent[]
    onCellClick: (date: Date, timeHour?: number) => void
}

export function YearView({
    currentDate,
    events,
    onCellClick,
}: TProps) {
    const year = currentDate.getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))

    return (
        <div className="flex-1 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {months.map((monthDate) => {
                    const monthStart = startOfMonth(monthDate)
                    const monthEnd = endOfMonth(monthDate)
                    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
                    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
                    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

                    const weeks = []
                    for (let i = 0; i < calendarDays.length; i += 7) {
                        weeks.push(calendarDays.slice(i, i + 7))
                    }

                    return (
                        <div
                            key={monthDate.toISOString()}
                            className="bg-background border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="p-3 border-b bg-muted/30">
                                <h3 className="text-sm font-semibold text-center">
                                    {format(monthDate, "MMMM")}
                                </h3>
                            </div>

                            <div className="p-2">
                                <div className="grid grid-cols-7 gap-1 mb-1">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                        <div key={index} className="text-xs text-muted-foreground text-center font-medium p-1">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    {weeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="grid grid-cols-7 gap-1">
                                            {week.map((day) => {
                                                const dayEvents = getEventsForDay(events, day)
                                                const isCurrentMonth = day.getMonth() === monthDate.getMonth()
                                                const isCurrentDay = isToday(day)
                                                const hasEvents = dayEvents.length > 0

                                                return (
                                                    <div
                                                        key={day.toISOString()}
                                                        className={cn(
                                                            "relative aspect-square flex items-center justify-center text-xs cursor-pointer rounded hover:bg-accent/50 transition-colors",
                                                            !isCurrentMonth && "text-muted-foreground/50",
                                                            isCurrentDay && "bg-primary text-primary-foreground font-semibold",
                                                            hasEvents && !isCurrentDay && "bg-accent/30"
                                                        )}
                                                        onClick={() => onCellClick(day)}
                                                    >
                                                        <span className="relative z-10">
                                                            {format(day, "d")}
                                                        </span>

                                                        {hasEvents && (
                                                            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                                                                {dayEvents.slice(0, 3).map((event) => (
                                                                    <div
                                                                        key={event.id}
                                                                        className={cn(
                                                                            "w-1 h-1 rounded-full",
                                                                            event.color === "blue" && "bg-blue-500",
                                                                            event.color === "emerald" && "bg-emerald-500",
                                                                            event.color === "orange" && "bg-orange-500",
                                                                            event.color === "violet" && "bg-violet-500",
                                                                            event.color === "rose" && "bg-rose-500",
                                                                            !["blue", "emerald", "orange", "violet", "rose"].includes(event.color) && "bg-gray-500"
                                                                        )}
                                                                    />
                                                                ))}
                                                                {dayEvents.length > 3 && (
                                                                    <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
