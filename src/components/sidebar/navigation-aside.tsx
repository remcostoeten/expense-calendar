import { SidebarInset } from "@/components/ui/sidebar"
import { NavigationSidebar } from "./navigation-sidebar"

export function NavigationAside() {
  return (
    <div className="fixed z-40 flex h-screen w-16 flex-col">
      <NavigationSidebar />
      <SidebarInset className="flex flex-col" />
    </div>
  )
}
