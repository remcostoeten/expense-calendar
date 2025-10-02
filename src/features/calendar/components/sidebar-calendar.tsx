"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useCalendarStore } from "@/stores/calendar-store"
import { cn } from "@/lib/utils"
import type { DayButton } from "react-day-picker"
import { getDefaultClassNames } from "react-day-picker"
import type { Event, Calendar as DbCalendar } from "@/server/schema"
import { startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { useCalendarData } from "../contexts/calendar-data-context"
import { COLOR_MAP } from "@/lib/colors"



interface SidebarCalendarProps {
  events?: Event[]
  calendars?: DbCalendar[]
}

const CustomDayButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof DayButton> & {
  events: Event[]
  calendars: DbCalendar[]
}>(
  ({ day, modifiers, className, events, calendars, ...props }, forwardedRef) => {
    // Get events for this specific day from database events
    const dayEvents = React.useMemo(() => {
      const dayStart = startOfDay(day.date)
      const dayEnd = endOfDay(day.date)
      
      return events.filter((event) => {
        const eventStart = startOfDay(new Date(event.startTime))
        const eventEnd = endOfDay(new Date(event.endTime))
        
        return (
          isWithinInterval(dayStart, { start: eventStart, end: eventEnd }) ||
          isWithinInterval(dayEnd, { start: eventStart, end: eventEnd }) ||
          isWithinInterval(eventStart, { start: dayStart, end: dayEnd })
        )
      })
    }, [day.date, events])

    const hasEvents = dayEvents.length > 0
    const defaultClassNames = getDefaultClassNames()
    const internalRef = React.useRef<HTMLButtonElement>(null)
    const ref = forwardedRef || internalRef

    React.useEffect(() => {
      if (modifiers.focused && typeof ref === 'object' && ref?.current) {
        ref.current.focus()
      }
    }, [modifiers.focused, ref])

    return (
      <div className="relative w-full h-full">
        <Button
          ref={ref}
          variant="ghost"
          size="icon"
          data-day={day.date.toLocaleDateString()}
          data-selected-single={
            modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
          }
          data-range-start={modifiers.range_start}
          data-range-end={modifiers.range_end}
          data-range-middle={modifiers.range_middle}
          className={cn(
            "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
            defaultClassNames.day,
            className,
          )}
          {...props}
        />
        {hasEvents && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 pointer-events-none z-10">
            {dayEvents.slice(0, 3).map((event, idx) => {
              const calendar = calendars.find((cal) => cal.id === event.calendarId)
              const color = calendar?.color ? COLOR_MAP[calendar.color] || "blue" : "blue"
              
              return (
                <span
                  key={idx}
                  className={cn(
                    "size-1 rounded-full",
                    color === "emerald" && "bg-emerald-500",
                    color === "orange" && "bg-orange-500",
                    color === "violet" && "bg-violet-500",
                    color === "blue" && "bg-blue-500",
                    color === "rose" && "bg-rose-500",
                    color === "cyan" && "bg-cyan-500",
                    color === "pink" && "bg-pink-500",
                    color === "red" && "bg-red-500",
                    color === "amber" && "bg-amber-500",
                    color === "teal" && "bg-teal-500",
                    color === "indigo" && "bg-indigo-500",
                    color === "purple" && "bg-purple-500",
                    !Object.values(COLOR_MAP).includes(color) && "bg-gray-500",
                  )}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }
)

CustomDayButton.displayName = "CustomDayButton"

export default function SidebarCalendar({ events: propEvents, calendars: propCalendars }: SidebarCalendarProps) {
  const { currentDate, setCurrentDate } = useCalendarStore()
  const { events: contextEvents, calendars: contextCalendars } = useCalendarData()
  
  // Use context data if available, otherwise fall back to props
  const events = contextEvents.length > 0 ? contextEvents : (propEvents || [])
  const calendars = contextCalendars.length > 0 ? contextCalendars : (propCalendars || [])

  const CustomDayButtonWithData = React.useCallback(
    (props: React.ComponentProps<typeof DayButton>) => (
      <CustomDayButton {...props} events={events} calendars={calendars} />
    ),
    [events, calendars]
  )

  return (
    <Calendar
      mode="single"
      selected={currentDate}
      onSelect={(date) => date && setCurrentDate(date)}
      className="rounded-md border"
      components={{
        DayButton: CustomDayButtonWithData,
      }}
    />
  )
}
