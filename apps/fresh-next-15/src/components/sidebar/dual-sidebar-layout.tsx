"use client"

import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { IconDashboardSidebar } from "./icon-dashboard-sidebar"
import { AppSidebar } from "./app-sidebar"
import { useRightSidebarStore } from "@/stores/right-sidebar-store"

interface DualSidebarLayoutProps {
  children: React.ReactNode
}

function DualSidebarLayoutInner({ children }: DualSidebarLayoutProps) {
  const { state } = useRightSidebarStore()

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      {/* Left Icon Sidebar */}
      <IconDashboardSidebar />

      {/* Main Content Area with Right Sidebar */}
      <div className="flex flex-1 overflow-hidden min-w-0">
        <SidebarInset className="overflow-auto flex-1 min-w-0">{children}</SidebarInset>

        {/* Right Calendar Sidebar - Desktop only, mobile uses Sheet */}
        <AppSidebar side="right" />
      </div>
    </div>
  )
}

export function DualSidebarLayout({ children }: DualSidebarLayoutProps) {
  return (
    <SidebarProvider>
      <DualSidebarLayoutInner>{children}</DualSidebarLayoutInner>
    </SidebarProvider>
  )
}
