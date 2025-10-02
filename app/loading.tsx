export const dynamic = 'force-dynamic'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="flex flex-col items-center space-y-8">
        {/* Calendar icon with pulsing animation */}
        <div className="relative">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-primary animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          {/* Animated ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-primary/40 animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>

        {/* Loading text with typewriter effect */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-foreground/90">
            Loading your calendar
          </h2>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-muted-foreground">Syncing events</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-primary rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full animate-pulse" />
        </div>

        {/* Floating dots animation */}
        <div className="flex space-x-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      </div>

    </div>
  )
}