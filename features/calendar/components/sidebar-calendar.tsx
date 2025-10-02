"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useCalendarStore } from "@/stores/calendar-store"
import { cn } from "@/lib/utils"
import type { DayButton } from "react-day-picker"
import { getDefaultClassNames } from "react-day-picker"

const CustomDayButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof DayButton>>(
  ({ day, modifiers, className, ...props }, forwardedRef) => {
    const { getEventsForDate } = useCalendarStore()
    const events = getEventsForDate(day.date)
    const hasEvents = events.length > 0
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
            {events.slice(0, 3).map((event, idx) => (
              <span
                key={idx}
                className={cn(
                  "size-1 rounded-full",
                  event.color === "emerald" && "bg-emerald-500",
                  event.color === "orange" && "bg-orange-500",
                  event.color === "violet" && "bg-violet-500",
                  event.color === "blue" && "bg-blue-500",
                  event.color === "rose" && "bg-rose-500",
                  !["emerald", "orange", "violet", "blue", "rose"].includes(event.color) && "bg-gray-500",
                )}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)

CustomDayButton.displayName = "CustomDayButton"

export default function SidebarCalendar() {
  const { currentDate, setCurrentDate } = useCalendarStore()

  return (
    <Calendar
      mode="single"
      selected={currentDate}
      onSelect={(date) => date && setCurrentDate(date)}
      className="rounded-md border"
      components={{
        DayButton: CustomDayButton,
      }}
    />
  )
}
