import { format } from "date-fns"
import { RiRepeatLine } from "@remixicon/react"
import { cn } from "@/lib/utils"
import { getColorClasses } from "../utils/calendar-utils"
import type { TCalendarEvent } from "./event-calendar"

type TProps = {
  event: TCalendarEvent
  top: number
  height: number
  hourHeight: number
  isBeingDragged: boolean
  onMouseDown: (event: TCalendarEvent, e: React.MouseEvent, handle?: 'top' | 'bottom') => void
  onClick: (event: TCalendarEvent, e: React.MouseEvent) => void
}

export function EventCard({
  event,
  top,
  height,
  hourHeight,
  isBeingDragged,
  onMouseDown,
  onClick,
}: TProps) {
  const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)

  return (
    <div
      data-event-id={event.id}
      className={cn(
        "absolute left-0 right-0 text-xs border rounded-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:z-10 cursor-move pointer-events-auto group p-2 h-full flex flex-col overflow-hidden",
        getColorClasses(event.color),
        isBeingDragged && "shadow-lg scale-105 z-50"
      )}
      style={{ top: `${top}px`, height: `${height}px` }}
      onMouseDown={(e) => onMouseDown(event, e)}
      onClick={(e) => onClick(event, e)}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1 cursor-n-resize opacity-0 group-hover:opacity-100 bg-current transition-opacity"
        onMouseDown={(e) => onMouseDown(event, e, 'top')}
      />

      <div
        className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize opacity-0 group-hover:opacity-100 bg-current transition-opacity"
        onMouseDown={(e) => onMouseDown(event, e, 'bottom')}
      />

      <div className="flex flex-col relative overflow-hidden flex-1">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="font-medium truncate flex-1">{event.title}</div>
            {event.isRecurring && <RiRepeatLine className="h-3 w-3 opacity-75 ml-1 flex-shrink-0" />}
          </div>
          <div className="text-xs opacity-75">
            {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
          </div>
          {event.location && <div className="text-xs opacity-75 truncate">{event.location}</div>}
        </div>

        {duration > 3 && (
          <>
            {Array.from({ length: Math.floor(duration / 2) }, (_, index) => (
              <div
                key={index}
                className="absolute left-2 right-2 bg-inherit border-t border-current/20 pt-1"
                style={{ top: `${(index + 1) * 2 * hourHeight}px` }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate flex-1 text-xs">{event.title}</div>
                  {event.isRecurring && <RiRepeatLine className="h-2.5 w-2.5 opacity-75 ml-1 flex-shrink-0" />}
                </div>
                <div className="text-xs opacity-60">
                  {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                </div>
              </div>
            ))}
          </>
        )}

        {duration > 4 && (
          <div className="absolute bottom-2 left-2 right-2 border-t border-current/20 pt-1">
            <div className="flex items-center justify-between">
              <div className="font-medium truncate flex-1 text-xs">{event.title}</div>
              {event.isRecurring && <RiRepeatLine className="h-2.5 w-2.5 opacity-75 ml-1 flex-shrink-0" />}
            </div>
            <div className="text-xs opacity-60">
              Ends {format(event.end, "HH:mm")}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}