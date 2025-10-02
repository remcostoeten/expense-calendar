import { useState, useEffect } from "react"

export function useCurrentTime(enabled: boolean) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(function updateCurrentTime() {
    if (!enabled) return

    setCurrentTime(new Date())

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [enabled])

  return currentTime
}