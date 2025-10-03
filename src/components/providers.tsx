"use client"

import type React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth/auth-context"
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
      <AuthProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </AuthProvider>
      <Toaster position="top-right" />
    </NextThemesProvider>
  )
}
