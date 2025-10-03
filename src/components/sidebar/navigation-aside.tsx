import { SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { NavigationSidebar } from "./navigation-sidebar"

export function NavigationAside() {
  const { state } = useSidebar()
  
  return (
    <div className={`fixed z-10 flex h-screen flex-col transition-[width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${state === "collapsed" ? "w-16" : "w-64"}`}>
      <NavigationSidebar />
      <SidebarInset className="flex flex-col" />
    </div>
  )
}
