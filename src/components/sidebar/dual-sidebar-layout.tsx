'use client'
import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { NavigationAside } from "./navigation-aside"
import { AppSidebar } from "./app-sidebar"
import { useRightSidebarStore } from "@/stores/right-sidebar-store"

type TProps = {
children: React.ReactNode
}

function DualSidebarLayoutInner({ children }: TProps) {
  const { state } = useRightSidebarStore()

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <NavigationAside/>

      <div className="flex flex-1 overflow-hidden min-w-0">
        <SidebarInset className={`overflow-auto flex-1 min-w-0 transition-[margin-right] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${state === "collapsed" ? "mr-0" : "mr-64"}`}>
          {children}
        </SidebarInset>

        <AppSidebar side="right" />
      </div>
    </div>
  )
}

export function DualSidebarLayout({ children }: TProps) {
  return (
    <SidebarProvider>
      <DualSidebarLayoutInner>{children}</DualSidebarLayoutInner>
    </SidebarProvider>
  )
}
