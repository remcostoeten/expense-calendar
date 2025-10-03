'use client'
import type React from "react"

import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { NavigationAside } from "./navigation-aside"
import { AppSidebar } from "./app-sidebar"
import { useRightSidebarStore } from "@/stores/right-sidebar-store"

type TProps = {
children: React.ReactNode
}

function DualSidebarLayoutInner({ children }: TProps) {
  const { state: rightSidebarState } = useRightSidebarStore()
  const { state: leftSidebarState } = useSidebar()

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <NavigationAside/>

      <div className={`flex flex-1 overflow-hidden min-w-0 transition-[margin-left] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${leftSidebarState === "collapsed" ? "ml-16" : "ml-64"}`}>
        <SidebarInset className={`overflow-auto flex-1 min-w-0 transition-[margin-right] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${rightSidebarState === "collapsed" ? "mr-0" : "mr-64"}`}>
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
