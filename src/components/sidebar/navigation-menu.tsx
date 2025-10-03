"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export type TRoute = {
  id: string
  title: string
  icon: React.ReactNode
  link: string
  subs?: Array<{
    title: string
    link: string
    icon?: React.ReactNode
  }>
}

type TProps = {
  routes: TRoute[]
}

export function NavigationMenu({ routes }: TProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Expense Tracker</SidebarGroupLabel>
      <SidebarMenu>
        {routes.map((item) => {
          const isActive = pathname === item.link || pathname?.startsWith(item.link + "/")

          return (
            <Collapsible key={item.id} asChild defaultOpen={item.id === "products"}>
              <SidebarMenuItem>
                {item.subs?.length ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <a href={item.link}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
                {item.subs?.length ? (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.subs.map((subItem) => {
                        const isSubActive = pathname === subItem.link

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <a href={subItem.link}>
                                {subItem.icon}
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}


