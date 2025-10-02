import { useState, useCallback, useEffect } from "react"

export function useZoom() {
  const [isZooming, setIsZooming] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomStartY, setZoomStartY] = useState(0)
  const [initialZoomLevel, setInitialZoomLevel] = useState(1)

  const getHourHeight = useCallback(function getHourHeight() {
    const baseHeight = window.innerWidth >= 640 ? 64 : 48
    return Math.round(baseHeight * zoomLevel)
  }, [zoomLevel])

  const handleZoomStart = useCallback(function handleZoomStart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsZooming(true)
    setZoomStartY(e.clientY)
    setInitialZoomLevel(zoomLevel)
  }, [zoomLevel])

  const handleZoomMove = useCallback(function handleZoomMove(e: MouseEvent) {
    if (!isZooming) return

    const deltaY = zoomStartY - e.clientY
    const zoomSensitivity = 0.005
    const newZoomLevel = Math.max(0.25, Math.min(4, initialZoomLevel + deltaY * zoomSensitivity))

    setZoomLevel(newZoomLevel)
  }, [isZooming, zoomStartY, initialZoomLevel])

  const handleZoomEnd = useCallback(function handleZoomEnd() {
    setIsZooming(false)
    setZoomStartY(0)
    setInitialZoomLevel(zoomLevel)
  }, [zoomLevel])

  useEffect(function addZoomListeners() {
    if (isZooming) {
      document.addEventListener('mousemove', handleZoomMove)
      document.addEventListener('mouseup', handleZoomEnd)

      return () => {
        document.removeEventListener('mousemove', handleZoomMove)
        document.removeEventListener('mouseup', handleZoomEnd)
      }
    }
  }, [isZooming, handleZoomMove, handleZoomEnd])

  return {
    zoomLevel,
    isZooming,
    getHourHeight,
    handleZoomStart,
  }
}