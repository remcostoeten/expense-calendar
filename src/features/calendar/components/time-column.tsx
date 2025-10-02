type TProps = {
  hourHeight: number
  onZoomStart: (e: React.MouseEvent) => void
  zoomLevel: number
}

export function TimeColumn({ hourHeight, onZoomStart, zoomLevel }: TProps) {
  return (
    <div className="sticky left-0 z-20 border-r bg-gradient-to-r from-background to-muted/20 relative group">
      <div className="absolute top-2 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 rounded px-1 py-0.5 text-xs text-muted-foreground border shadow-sm">
        {zoomLevel.toFixed(1)}x
      </div>

      {Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className="border-b border-border/30 flex items-center justify-center text-xs text-muted-foreground bg-background/95 cursor-ns-resize hover:bg-accent/20 transition-colors"
          style={{ height: `${hourHeight}px` }}
          onMouseDown={onZoomStart}
          title="Drag to zoom in/out"
        >
          <span className="hidden sm:inline">{hour.toString().padStart(2, "0")}:00</span>
          <span className="sm:hidden">{hour.toString().padStart(2, "0")}</span>
        </div>
      ))}
    </div>
  )
}