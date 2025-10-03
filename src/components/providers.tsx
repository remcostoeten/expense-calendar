"use client"

import type React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"
import { TooltipProvider } from "./ui/tooltip"

type TProps = {
  children: React.ReactNode
}

export function Providers({ children }: TProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
      </TooltipProvider>
      <Toaster position="top-right" />
    </NextThemesProvider>
  )
}
