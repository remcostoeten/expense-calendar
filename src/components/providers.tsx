"use client"

import type React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth/auth-context"
import { Toaster } from "sonner"
import { TooltipProvider } from "./ui/tooltip"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

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
      <AuthProvider>
        <TooltipProvider delayDuration={0}>
          {children}
          <SpeedInsights />
          <Analytics />
        </TooltipProvider>
      </AuthProvider>
      <Toaster position="top-right" />
    </NextThemesProvider>
  )
}
