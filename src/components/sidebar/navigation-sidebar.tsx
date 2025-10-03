"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Home,
  Settings,
  TrendingUp,
  Calculator,
  Car,
  Euro,
  History,
  MapPin,
  Plus,
  RouteIcon,
  User,
  Wallet,
  Calendar,
} from "lucide-react"
import { Logo } from "./logo"
import { NavigationMenu } from "./navigation-menu"
import { NotificationsPopover } from "./notifications-popover"
import { AuthTeamSwitcher } from "./auth-team-switcher"
import Link from "next/link"

const FAKE_NOTIFICATIONS = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "JL",
    text: "Server upgrade completed.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "HH",
    text: "New user signed up.",
    time: "2h ago",
  },
]

const ROUTES = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <Home className="size-4" />,
    link: "/dashboard/calendar",
  },
  {
    id: "calendar",
    title: "Calendar",
    icon: <Calendar className="size-4" />,
    link: "/dashboard/calendar",
  },
  {
    id: "trips",
    title: "Trips",
    icon: <Car className="size-4" />,
    link: "/dashboard/trips",
    subs: [
      {
        title: "Add New Trip",
        link: "#",
        icon: <Plus className="size-4" />,
      },
      {
        title: "Trip History",
        link: "#",
        icon: <History className="size-4" />,
      },
      {
        title: "Route Planner",
        link: "#",
        icon: <RouteIcon className="size-4" />,
      },
    ],
  },
  {
    id: "addresses",
    title: "Addresses",
    icon: <MapPin className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Home Address",
        link: "#",
        icon: <Home className="size-4" />,
      },
      {
        title: "Work Address",
        link: "#",
        icon: <MapPin className="size-4" />,
      },
    ],
  },
  {
    id: "expenses",
    title: "Expenses",
    icon: <Euro className="size-4" />,
    link: "#",
    subs: [
      {
        title: "Monthly Overview",
        link: "#",
        icon: <TrendingUp className="size-4" />,
      },
      {
        title: "Rate Settings",
        link: "#",
        icon: <Calculator className="size-4" />,
      },
      {
        title: "Export Reports",
        link: "#",
        icon: <Wallet className="size-4" />,
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    icon: <User className="size-4" />,
    link: "#",
  },
  {
    id: "settings",
    title: "Settings",
    icon: <Settings className="size-4" />,
    link: "#",
    subs: [
      { title: "General", link: "#" },
      { title: "Notifications", link: "#" },
      { title: "Privacy", link: "#" },
    ],
  },
]
export function NavigationSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed ? "flex-col items-center justify-center gap-2" : "flex-row items-center justify-between",
        )}
      >
        <Link href="/dashboard/calendar" className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
          <Logo className="h-8 w-8" />
          {!isCollapsed && <span className="font-semibold text-black dark:text-white">KmTracker</span>}
        </Link>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn("flex items-center gap-2", isCollapsed ? "flex-col" : "flex-row")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <NotificationsPopover notifications={FAKE_NOTIFICATIONS} />
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className={cn("gap-4 py-4", isCollapsed ? "px-1" : "px-2")}>
        <NavigationMenu routes={ROUTES} />
      </SidebarContent>
      <SidebarFooter className={cn(isCollapsed ? "px-1" : "px-2")}>
        <AuthTeamSwitcher />
      </SidebarFooter>
    </Sidebar>
  )
}
