"use client"

import type * as React from "react"
import { useState } from "react"
import {
  RiCheckLine,
  RiSidebarUnfoldLine,
  RiCloseLine,
  RiAddLine,
  RiCalendarEventLine,
  RiRepeatLine,
  RiEyeLine,
  RiEyeOffLine,
} from "@remixicon/react"
import { CalendarSettings } from "@/features/calendar/components/calendar-settings"
import { CalendarCreationModal } from "@/features/calendar/components/calendar-creation-modal"
import SidebarCalendar from "@/features/calendar/components/sidebar-calendar"
import { useRightSidebarStore } from "@/stores/right-sidebar-store"
import { useCalendarStore } from "@/stores/calendar-store"
import { format, isToday, isTomorrow } from "date-fns"

import {
  type Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

function MobileSidebarContent() {
  const {
    calendars,
    toggleColorVisibility,
    getUpcomingEvents,
    getPreviousEvents,
    showRecurringEvents,
    toggleRecurringEvents,
  } = useCalendarStore()
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [showPreviousEvents, setShowPreviousEvents] = useState(false)

  const upcomingEvents = getUpcomingEvents(5)
  const previousEvents = getPreviousEvents(10)

  const formatEventTime = (event: any) => {
    if (event.allDay) return "All day"
    if (isToday(event.start)) return format(event.start, "h:mm a")
    if (isTomorrow(event.start)) return `Tomorrow, ${format(event.start, "h:mm a")}`
    return format(event.start, "MMM d, h:mm a")
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b border-border/50 p-4">
        <div className="flex justify-between items-center">
          <SheetTitle>Calendar</SheetTitle>
          <CalendarSettings />
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <SidebarCalendar />
        </div>

        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground/65">
              {showPreviousEvents ? "Previous Events" : "Upcoming Events"}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPreviousEvents(!showPreviousEvents)}
                title={showPreviousEvents ? "Show upcoming events" : "Show previous events"}
              >
                <RiCalendarEventLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={toggleRecurringEvents}
                title={showRecurringEvents ? "Hide recurring events" : "Show recurring events"}
              >
                {showRecurringEvents ? <RiEyeLine className="h-4 w-4" /> : <RiEyeOffLine className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-2">
              {(showPreviousEvents ? previousEvents : upcomingEvents).map((event) => (
                <div key={event.id} className="flex flex-col gap-1 p-2 rounded-md hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate flex-1">{event.title}</span>
                    {event.isRecurring && <RiRepeatLine className="h-3 w-3 text-muted-foreground ml-1 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full flex-shrink-0 ${
                        event.color === "emerald"
                          ? "bg-emerald-500"
                          : event.color === "orange"
                            ? "bg-orange-500"
                            : event.color === "violet"
                              ? "bg-violet-500"
                              : event.color === "blue"
                                ? "bg-blue-500"
                                : event.color === "rose"
                                  ? "bg-rose-500"
                                  : "bg-gray-500"
                      }`}
                    />
                    <span className="text-xs text-muted-foreground truncate">{formatEventTime(event)}</span>
                  </div>
                  {event.location && (
                    <span className="text-xs text-muted-foreground truncate">📍 {event.location}</span>
                  )}
                </div>
              ))}
              {(showPreviousEvents ? previousEvents : upcomingEvents).length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No {showPreviousEvents ? "previous" : "upcoming"} events
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground/65">Calendars</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCalendarModalOpen(true)}
            >
              <RiAddLine className="h-4 w-4" />
              <span className="sr-only">Add calendar</span>
            </Button>
          </div>

          <div className="space-y-2">
            {calendars.map((calendar) => (
              <button
                key={calendar.id}
                type="button"
                onClick={() => toggleColorVisibility(calendar.color)}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className={`grid place-content-center size-4 shrink-0 rounded-[4px] border border-input ${calendar.isVisible ? 'bg-primary border-primary text-primary-foreground' : ''}`}>
                    <RiCheckLine
                      className={`${calendar.isVisible ? "visible" : "invisible"}`}
                      size={12}
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    className={`${!calendar.isVisible ? "line-through text-muted-foreground/65" : ""} text-sm font-medium`}
                  >
                    {calendar.name}
                  </span>
                </span>
                <span
                  className={`size-3 rounded-full border-2 border-white shadow-sm ${
                    calendar.color === "emerald"
                      ? "bg-emerald-500"
                      : calendar.color === "orange"
                        ? "bg-orange-500"
                        : calendar.color === "violet"
                          ? "bg-violet-500"
                          : calendar.color === "blue"
                            ? "bg-blue-500"
                            : calendar.color === "rose"
                              ? "bg-rose-500"
                              : "bg-gray-500"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 p-4">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>

      <CalendarCreationModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} />
    </div>
  )
}

export function RightSidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state } = useRightSidebarStore()

  return (
    <>
      <Button variant="ghost" size="icon" className={`${className} hidden lg:flex`} onClick={toggleSidebar} {...props}>
        {state === "collapsed" ? <RiSidebarUnfoldLine className="size-5" /> : <RiCloseLine className="size-5" />}
        <span className="sr-only">Toggle right sidebar</span>
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className={`${className} lg:hidden`} {...props}>
            <RiSidebarUnfoldLine className="size-5" />
            <span className="sr-only">Open calendar sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0">
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    calendars,
    toggleColorVisibility,
    getUpcomingEvents,
    getPreviousEvents,
    showRecurringEvents,
    toggleRecurringEvents,
  } = useCalendarStore()
  const { state } = useRightSidebarStore()
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [showPreviousEvents, setShowPreviousEvents] = useState(false)

  const upcomingEvents = getUpcomingEvents(5)
  const previousEvents = getPreviousEvents(10)

  const formatEventTime = (event: any) => {
    if (event.allDay) return "All day"
    if (isToday(event.start)) return format(event.start, "h:mm a")
    if (isTomorrow(event.start)) return `Tomorrow, ${format(event.start, "h:mm a")}`
    return format(event.start, "MMM d, h:mm a")
  }

  return (
    <div className="group peer text-sidebar-foreground hidden lg:block" data-state={state} data-side="right">
      <div
        className={`relative z-10 h-full transition-[width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${state === "collapsed" ? "w-0" : "w-64"} overflow-hidden`}
      >
        <div className="bg-sidebar/95 backdrop-blur-sm flex h-full w-64 flex-col border-l border-border/50 overflow-hidden">
          <SidebarHeader className="border-b border-border/50 flex-shrink-0">
            <div className="flex justify-between items-center">
              <CalendarSettings />
              <RightSidebarTrigger className="text-muted-foreground hover:text-foreground" />
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarGroup className="px-1 pt-4 flex-shrink-0">
              <SidebarCalendar />
            </SidebarGroup>

            <SidebarGroup className="px-1 mt-3 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between flex-shrink-0">
                <SidebarGroupLabel className="uppercase text-muted-foreground/65">
                  {showPreviousEvents ? "Previous Events" : "Upcoming Events"}
                </SidebarGroupLabel>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPreviousEvents(!showPreviousEvents)}
                    title={showPreviousEvents ? "Show upcoming events" : "Show previous events"}
                  >
                    <RiCalendarEventLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={toggleRecurringEvents}
                    title={showRecurringEvents ? "Hide recurring events" : "Show recurring events"}
                  >
                    {showRecurringEvents ? <RiEyeLine className="h-4 w-4" /> : <RiEyeOffLine className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <SidebarGroupContent>
                <ScrollArea className="h-48">
                  <SidebarMenu>
                    {(showPreviousEvents ? previousEvents : upcomingEvents).map((event) => (
                      <SidebarMenuItem key={event.id}>
                        <SidebarMenuButton className="flex-col items-start h-auto py-2 px-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-sm truncate flex-1">{event.title}</span>
                            {event.isRecurring && (
                              <RiRepeatLine className="h-3 w-3 text-muted-foreground ml-1 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 w-full">
                            <span
                              className={`size-2 rounded-full flex-shrink-0 ${
                                event.color === "emerald"
                                  ? "bg-emerald-500"
                                  : event.color === "orange"
                                    ? "bg-orange-500"
                                    : event.color === "violet"
                                      ? "bg-violet-500"
                                      : event.color === "blue"
                                        ? "bg-blue-500"
                                        : event.color === "rose"
                                          ? "bg-rose-500"
                                          : "bg-gray-500"
                              }`}
                            />
                            <span className="text-xs text-muted-foreground truncate">{formatEventTime(event)}</span>
                          </div>
                          {event.location && (
                            <span className="text-xs text-muted-foreground truncate w-full">📍 {event.location}</span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {(showPreviousEvents ? previousEvents : upcomingEvents).length === 0 && (
                      <SidebarMenuItem>
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No {showPreviousEvents ? "previous" : "upcoming"} events
                        </div>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="px-1 mt-3 pt-4 border-t border-border/50 flex-1 min-h-0">
              <div className="flex items-center justify-between flex-shrink-0">
                <SidebarGroupLabel className="uppercase text-muted-foreground/65">Calendars</SidebarGroupLabel>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsCalendarModalOpen(true)}
                >
                  <RiAddLine className="h-4 w-4" />
                  <span className="sr-only">Add calendar</span>
                </Button>
              </div>
              <SidebarGroupContent className="overflow-y-auto">
                <SidebarMenu>
                  {calendars.map((calendar) => (
                    <SidebarMenuItem key={calendar.id}>
                      <SidebarMenuButton
                        onClick={() => toggleColorVisibility(calendar.color)}
                        className="relative rounded-md [&>svg]:size-auto justify-between has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px]"
                      >
                        <span className="font-medium flex items-center gap-3">
                          <span className={`grid place-content-center size-4 shrink-0 rounded-[4px] border border-input ${calendar.isVisible ? 'bg-primary border-primary text-primary-foreground' : ''}`}>
                            <RiCheckLine
                              className={`${calendar.isVisible ? "visible" : "invisible"}`}
                              size={12}
                              aria-hidden="true"
                            />
                          </span>
                          <span
                            className={`${!calendar.isVisible ? "line-through text-muted-foreground/65" : ""}`}
                          >
                            {calendar.name}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-3 rounded-full border-2 border-white shadow-sm ${
                              calendar.color === "emerald"
                                ? "bg-emerald-500"
                                : calendar.color === "orange"
                                  ? "bg-orange-500"
                                  : calendar.color === "violet"
                                    ? "bg-violet-500"
                                    : calendar.color === "blue"
                                      ? "bg-blue-500"
                                      : calendar.color === "rose"
                                        ? "bg-rose-500"
                                        : "bg-gray-500"
                            }`}
                          />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/50 flex-shrink-0">
            <div className="flex justify-center p-2">
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </div>
      </div>
    </div>
  )
}
