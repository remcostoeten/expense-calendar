"use client"

import type React from "react"

export const dynamic = 'force-dynamic'

type TProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: TProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-4">Please try refreshing the page.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}