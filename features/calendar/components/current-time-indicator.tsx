import { format } from "date-fns"

type TProps = {
  currentTime: Date
  position: number
}

export function CurrentTimeIndicator({ currentTime, position }: TProps) {
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${position}px` }}
    >
      <div className="flex items-center relative">
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 bg-red-500/90 text-white text-xs px-1.5 py-0.5 rounded font-medium shadow-sm whitespace-nowrap z-20">
          {format(currentTime, "HH:mm")}
        </div>
        <div className="w-full relative">
          <div className="h-px bg-red-500/80 shadow-sm" />
          <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </div>
      </div>
    </div>
  )
}