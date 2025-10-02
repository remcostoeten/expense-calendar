import { useEffect, useCallback } from "react"

type KeyboardShortcut = {
  key: string
  shift?: boolean
  ctrl?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const shiftMatches = !!event.shiftKey === !!shortcut.shift
      const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrl
      const altMatches = !!event.altKey === !!shortcut.alt
      const metaMatches = !!event.metaKey === !!shortcut.meta

      if (keyMatches && shiftMatches && ctrlMatches && altMatches && metaMatches) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export function KeyboardIndicator({ shortcuts }: { shortcuts: Array<{ keys: string[], action: string }> }) {
  return (
    <div className="flex gap-2 text-xs text-muted-foreground">
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex items-center gap-1">
          <kbd className="inline-flex items-center rounded border bg-muted px-1 font-mono text-xs">
            {shortcut.keys.join(" + ")}
          </kbd>
          <span className="text-xs">{shortcut.action}</span>
        </div>
      ))}
    </div>
  )
}
