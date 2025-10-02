"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { IconDashboardSidebar } from "./icon-dashboard-sidebar"

export function IconSidebar() {
  return (
    <div className="fixed z-40 flex h-screen w-16 flex-col">
      <IconDashboardSidebar />
      <SidebarInset className="flex flex-col" />
    </div>
  )
}
