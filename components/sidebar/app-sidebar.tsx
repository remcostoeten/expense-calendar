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
import { ProviderConnectionModal } from "@/features/calendar/components/provider-connection-modal"
import { CalendarContextMenu } from "@/features/calendar/components/calendar-context-menu"
import { useTransition } from "react"
import { useRightSidebarStore } from "@/stores/right-sidebar-store"
import { type CalendarEvent, useCalendarStore } from "@/stores/calendar-store"
import { useCalendarData } from "@/features/calendar/contexts/calendar-data-context"
import { useCalendarSync } from "@/server/api-hooks/use-calendar-sync"
import { useProviderConnections } from "@/features/calendar/hooks/use-provider-connections"
import { useCalendarManagement } from "@/server/api-hooks/use-calendar-management"
import { useKeyboardShortcuts, KeyboardIndicator } from "@/hooks/use-keyboard-shortcuts"
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
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function MobileSidebarContent({ contextMenuHandlers }: { contextMenuHandlers: {
  onReorder: (calendarId: string, direction: 'up' | 'down') => void
  onEdit: (calendar: any) => void
  onDelete: (calendarId: string) => void
}}) {
  const {
    calendars,
    externalProviders,
    toggleColorVisibility,
    toggleExternalProviderVisibility,
    getUpcomingEvents,
    getPreviousEvents,
    showRecurringEvents,
    setShowRecurringEvents,
  } = useCalendarStore()
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [showPreviousEvents, setShowPreviousEvents] = useState(false)

  const { userId } = useCalendarData()

  const { mutate: mutateCalendars } = useCalendarSync(userId || 0)

  const { connections, isLoading: isLoadingConnections } = useProviderConnections(userId || 0)

  const upcomingEvents = getUpcomingEvents(5)
  const previousEvents = getPreviousEvents(10)

  const formatEventTime = (event: CalendarEvent) => {
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
        <div className="p-6">
          <SidebarCalendar />
        </div>

        <div className="px-6 py-4 border-t border-border/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                onClick={() => setShowRecurringEvents(!showRecurringEvents)}
                title={showRecurringEvents ? "Hide recurring events" : "Show recurring events"}
              >
                {showRecurringEvents ? <RiEyeLine className="h-4 w-4" /> : <RiEyeOffLine className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-48">
            <div className="space-y-3">
              {(showPreviousEvents ? previousEvents : upcomingEvents).map((event) => (
                <div key={event.id} className="flex flex-col gap-1 p-3 rounded-lg hover:bg-accent/50 transition-colors">
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
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                      <RiCalendarEventLine className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">No {showPreviousEvents ? "previous" : "upcoming"} events</p>
                      <p className="text-xs text-muted-foreground/70">
                        {showPreviousEvents
                          ? "Your past events will appear here"
                          : "Your future events will appear here when you create them"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="px-6 py-4 border-t border-border/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Calendars</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg transition-all duration-200 hover:scale-105"
              onClick={() => setIsCalendarModalOpen(true)}
              title="Add new calendar"
            >
              <RiAddLine className="h-4 w-4" />
              <span className="sr-only">Add calendar</span>
            </Button>
          </div>

          <div className="space-y-2">
            {calendars.map((calendar) => (
              <div key={calendar.id} data-calendar-id={calendar.id}>
                <CalendarContextMenu
                  calendar={calendar}
                  onReorder={contextMenuHandlers.onReorder}
                  onEdit={contextMenuHandlers.onEdit}
                  onDelete={contextMenuHandlers.onDelete}
                >
                <button
                  type="button"
                  onClick={() => toggleColorVisibility(calendar.color)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
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
                </CalendarContextMenu>
              </div>
            ))}
            {calendars.length === 0 && (
              <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                    <RiCalendarEventLine className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">No calendars yet</p>
                    <p className="text-xs text-muted-foreground/70">
                      Create your first calendar to start organizing your events
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <RiAddLine className="h-4 w-4" />
                    <span className="text-sm font-medium">Add External Calendar</span>
                  </span>
                  <RiAddLine className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start" side="right">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-sm">Connect External Calendars</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect your external calendar accounts to sync events
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {externalProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        provider.isConnected
                          ? "bg-accent/30 border-border/50"
                          : "bg-muted/30 border-border/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`grid place-content-center size-4 shrink-0 rounded-[4px] border ${
                          provider.isConnected && provider.isVisible
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-input'
                        }`}>
                          <RiCheckLine
                            className={`${provider.isConnected && provider.isVisible ? "visible" : "invisible"}`}
                            size={12}
                            aria-hidden="true"
                          />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${
                              !provider.isConnected || !provider.isVisible ? "line-through text-muted-foreground/65" : ""
                            }`}>
                              {provider.name}
                            </span>
                            <span
                              className={`size-3 rounded-full border border-background/50 ${
                                provider.color === "emerald"
                                  ? "bg-emerald-500"
                                  : provider.color === "orange"
                                    ? "bg-orange-500"
                                    : provider.color === "violet"
                                      ? "bg-violet-500"
                                      : provider.color === "blue"
                                        ? "bg-blue-500"
                                        : provider.color === "rose"
                                          ? "bg-rose-500"
                                          : "bg-gray-500"
                              }`}
                            />
                          </div>
                          {!provider.isConnected && (
                            <span className="text-xs text-muted-foreground/60">(Not connected)</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => toggleExternalProviderVisibility(provider.provider)}
                        disabled={!provider.isConnected}
                      >
                        {provider.isConnected && provider.isVisible ? "Hide" : "Show"}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border/50">
                  <ProviderConnectionModal
                    userId={userId || 0}
                    externalProviders={externalProviders}
                    trigger={
                      <Button variant="default" size="sm" className="w-full">
                        <RiAddLine className="h-4 w-4 mr-2" />
                        Connect New Provider
                      </Button>
                    }
                  />
                </div>
              </PopoverContent>
            </Popover>
        </div>
      </div>

      <div className="border-t border-border/30 p-6">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>

      <CalendarCreationModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)}
        userId={userId}
        onCalendarCreated={async () => {
          if (userId) {
            await mutateCalendars()
          }
        }}
      />
    </div>
  )
}

export function RightSidebarTrigger({
  className,
  contextMenuHandlers,
  ...props
}: React.ComponentProps<typeof Button> & {
  contextMenuHandlers: {
    onReorder: (calendarId: string, direction: 'up' | 'down') => void
    onEdit: (calendar: any) => void
    onDelete: (calendarId: string) => void
  }
}) {
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
          <MobileSidebarContent contextMenuHandlers={contextMenuHandlers} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useRightSidebarStore()
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [showPreviousEvents, setShowPreviousEvents] = useState(false)
  const {
    calendars,
    externalProviders,
    toggleColorVisibility,
    toggleExternalProviderVisibility,
    getUpcomingEvents,
    getPreviousEvents,
    showRecurringEvents,
    setShowRecurringEvents,
  } = useCalendarStore()

  // Get userId from calendar data context
  const { userId } = useCalendarData()

  // Get mutate function to refresh calendars after creation
  const { mutate: mutateCalendars } = useCalendarSync(userId || 0)

  // Get provider connections
  const { connections, isLoading: isLoadingConnections } = useProviderConnections(userId || 0)

  // Get calendar management hooks
  const calendarManagement = useCalendarManagement()
  const [isPending, startTransition] = useTransition()

  const upcomingEvents = getUpcomingEvents(5)
  const previousEvents = getPreviousEvents(10)
const formatEventTime = (event: CalendarEvent) => {
    if (event.allDay) return "All day"
    if (isToday(event.start)) return format(event.start, "h:mm a")
    if (isTomorrow(event.start)) return `Tomorrow, ${format(event.start, "h:mm a")}`
    return format(event.start, "MMM d, h:mm a")
  }

  // Context menu handlers (shared between desktop and mobile)
  const handleReorderCalendar = (calendarId: string, direction: 'up' | 'down') => {
    startTransition(() => {
      const currentIndex = calendars.findIndex(cal => cal.id === calendarId)
      if (currentIndex === -1) return

      let newIndex
      if (direction === 'up' && currentIndex > 0) {
        newIndex = currentIndex - 1
      } else if (direction === 'down' && currentIndex < calendars.length - 1) {
        newIndex = currentIndex + 1
      } else {
        return
      }

      // Create new order array for optimistic update
      const reorderedCalendars = [...calendars]
      const [movedCalendar] = reorderedCalendars.splice(currentIndex, 1)
      reorderedCalendars.splice(newIndex, 0, movedCalendar)

      // Update sort orders
      const calendarOrders = reorderedCalendars.map((cal, index) => ({
        id: parseInt(cal.id),
        sortOrder: index,
      }))

      // Execute with optimistic update and useTransition
      calendarManagement.reorderCalendars.execute({ calendarOrders })
    })
  }

  const handleEditCalendar = (calendar: any) => {
    calendarManagement.updateCalendar.execute({
      calendarId: parseInt(calendar.id),
      updates: {
        name: calendar.name,
        color: calendar.color,
        description: calendar.description,
      },
    })
  }

  const handleDeleteCalendar = (calendarId: string) => {
    calendarManagement.deleteCalendar.execute({ calendarId: parseInt(calendarId) })
  }

  // Keyboard shortcuts for calendar management (shared between desktop and mobile)
  const keyboardShortcuts = [
    {
      key: "ArrowUp",
      shift: true,
      action: () => {
        // Find the currently focused calendar (if any) and move it up
        const focusedElement = document.activeElement
        const calendarItem = focusedElement?.closest('[data-calendar-id]')
        if (calendarItem) {
          const calendarId = calendarItem.getAttribute('data-calendar-id')
          if (calendarId) {
            handleReorderCalendar(calendarId, 'up')
          }
        }
      }
    },
    {
      key: "ArrowDown",
      shift: true,
      action: () => {
        // Find the currently focused calendar (if any) and move it down
        const focusedElement = document.activeElement
        const calendarItem = focusedElement?.closest('[data-calendar-id]')
        if (calendarItem) {
          const calendarId = calendarItem.getAttribute('data-calendar-id')
          if (calendarId) {
            handleReorderCalendar(calendarId, 'down')
          }
        }
      }
    }
  ]

  useKeyboardShortcuts(keyboardShortcuts)

  return (
    <div className="group peer text-sidebar-foreground hidden lg:block" data-state={state} data-side="right">
      <div
        className={`relative z-10 h-full transition-[width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${state === "collapsed" ? "w-0" : "w-64"} overflow-hidden`}
      >
        <div className="bg-sidebar/95 backdrop-blur-sm flex h-full w-64 flex-col border-l border-border/50 overflow-hidden">
          <SidebarHeader className="border-b border-border/30 flex-shrink-0 p-4">
            <div className="flex justify-between items-center">
              <CalendarSettings />
              <RightSidebarTrigger
                className="text-muted-foreground hover:text-foreground"
                contextMenuHandlers={{
                  onReorder: handleReorderCalendar,
                  onEdit: handleEditCalendar,
                  onDelete: handleDeleteCalendar,
                }}
              />
            </div>
          </SidebarHeader>
          <SidebarContent className="gap-0 flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarGroup className="px-4 pt-6 flex-shrink-0">
              <SidebarCalendar />
            </SidebarGroup>

            <SidebarGroup className="px-4 mt-6 pt-6 border-t border-border/30">
              <div className="flex items-center justify-between flex-shrink-0 mb-4">
                <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
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
                    onClick={() => setShowRecurringEvents(!showRecurringEvents)}
                    title={showRecurringEvents ? "Hide recurring events" : "Show recurring events"}
                  >
                    {showRecurringEvents ? <RiEyeLine className="h-4 w-4" /> : <RiEyeOffLine className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <SidebarGroupContent>
                <ScrollArea className="h-44">
                  <SidebarMenu className="space-y-1">
                    {(showPreviousEvents ? previousEvents : upcomingEvents).map((event) => (
                      <SidebarMenuItem key={event.id}>
                        <SidebarMenuButton className="flex-col items-start h-auto py-2.5 px-3 rounded-md hover:bg-accent/40 transition-all duration-200 border border-transparent hover:border-border/30">
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-medium text-sm truncate flex-1 text-foreground">{event.title}</span>
                            {event.isRecurring && (
                              <RiRepeatLine className="h-3 w-3 text-muted-foreground/60 ml-2 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2.5 w-full">
                            <span
                              className={`size-2 rounded-full flex-shrink-0 shadow-sm ${
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
                            <span className="text-xs text-muted-foreground/80 truncate font-medium">{formatEventTime(event)}</span>
                          </div>
                          {event.location && (
                            <span className="text-xs text-muted-foreground/70 truncate w-full mt-1">📍 {event.location}</span>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                    {(showPreviousEvents ? previousEvents : upcomingEvents).length === 0 && (
                      <SidebarMenuItem>
                        <div className="px-3 py-8 text-sm text-muted-foreground/60 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                              <RiCalendarEventLine className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">No {showPreviousEvents ? "previous" : "upcoming"} events</p>
                              <p className="text-xs text-muted-foreground/70">
                                {showPreviousEvents
                                  ? "Your past events will appear here"
                                  : "Your future events will appear here when you create them"
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="px-4 mt-6 pt-6 border-t border-border/30 flex-1 min-h-0">
              <div className="flex items-center justify-between flex-shrink-0 mb-4">
                <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Calendars</SidebarGroupLabel>
                <div className="flex items-center gap-2">
                  <KeyboardIndicator
                    shortcuts={[
                      { keys: ["Shift", "↑"], action: "Move up" },
                      { keys: ["Shift", "↓"], action: "Move down" }
                    ]}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg transition-all duration-200 hover:scale-105"
                    onClick={() => setIsCalendarModalOpen(true)}
                    title="Add new calendar"
                  >
                    <RiAddLine className="h-4 w-4" />
                    <span className="sr-only">Add calendar</span>
                  </Button>
                </div>
              </div>
              <SidebarGroupContent className="overflow-y-auto">
                <SidebarMenu className="space-y-2">
                  {calendars.map((calendar) => (
                    <SidebarMenuItem key={calendar.id}>
                      <div data-calendar-id={calendar.id}>
                        <CalendarContextMenu
                          calendar={calendar}
                          onReorder={handleReorderCalendar}
                          onEdit={handleEditCalendar}
                          onDelete={handleDeleteCalendar}
                        >
                        <SidebarMenuButton
                          onClick={() => toggleColorVisibility(calendar.color)}
                          className="relative rounded-lg [&>svg]:size-auto justify-between has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px] py-3 px-3 hover:bg-accent/40 transition-all duration-200 border border-transparent hover:border-border/30 group"
                        >
                          <span className="font-medium flex items-center gap-3 flex-1 min-w-0">
                            <span className={`grid place-content-center size-4 shrink-0 rounded border transition-all duration-200 ${calendar.isVisible ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'border-input group-hover:border-border'}`}>
                              <RiCheckLine
                                className={`transition-opacity duration-200 ${calendar.isVisible ? "opacity-100" : "opacity-0"}`}
                                size={12}
                                aria-hidden="true"
                              />
                            </span>
                            <span
                              className={`truncate transition-all duration-200 ${!calendar.isVisible ? "line-through text-muted-foreground/60" : "text-foreground"}`}
                            >
                              {calendar.name}
                            </span>
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`size-3 rounded-full border border-background/50 shadow-sm transition-transform duration-200 group-hover:scale-110 ${
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
                        </CalendarContextMenu>
                      </div>
                    </SidebarMenuItem>
                  ))}

                  {calendars.length === 0 && (
                    <SidebarMenuItem>
                      <div className="px-3 py-8 text-sm text-muted-foreground/60 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                            <RiCalendarEventLine className="h-6 w-6 text-muted-foreground/60" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">No calendars yet</p>
                            <p className="text-xs text-muted-foreground/70">
                              Create your first calendar to start organizing your events
                            </p>
                          </div>
                        </div>
                      </div>
                    </SidebarMenuItem>
                  )}

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <RiAddLine className="h-4 w-4" />
                            <span className="text-sm font-medium">Add External Calendar</span>
                          </span>
                          <RiAddLine className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start" side="right">
                        <div className="p-4 border-b border-border/50">
                          <h3 className="font-semibold text-sm">Connect External Calendars</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Connect your external calendar accounts to sync events
                          </p>
                        </div>
                        <div className="p-4 space-y-3">
                          {externalProviders.map((provider) => (
                            <div
                              key={provider.id}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                provider.isConnected
                                  ? "bg-accent/30 border-border/50"
                                  : "bg-muted/30 border-border/30"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`grid place-content-center size-4 shrink-0 rounded-[4px] border ${
                                  provider.isConnected && provider.isVisible
                                    ? 'bg-primary border-primary text-primary-foreground'
                                    : 'border-input'
                                }`}>
                                  <RiCheckLine
                                    className={`${provider.isConnected && provider.isVisible ? "visible" : "invisible"}`}
                                    size={12}
                                    aria-hidden="true"
                                  />
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium text-sm ${
                                      !provider.isConnected || !provider.isVisible ? "line-through text-muted-foreground/65" : ""
                                    }`}>
                                      {provider.name}
                                    </span>
                                    <span
                                      className={`size-3 rounded-full border border-background/50 ${
                                        provider.color === "emerald"
                                          ? "bg-emerald-500"
                                          : provider.color === "orange"
                                            ? "bg-orange-500"
                                            : provider.color === "violet"
                                              ? "bg-violet-500"
                                              : provider.color === "blue"
                                                ? "bg-blue-500"
                                                : provider.color === "rose"
                                                  ? "bg-rose-500"
                                                  : "bg-gray-500"
                                      }`}
                                    />
                                  </div>
                                  {!provider.isConnected && (
                                    <span className="text-xs text-muted-foreground/60">(Not connected)</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => toggleExternalProviderVisibility(provider.provider)}
                                disabled={!provider.isConnected}
                              >
                                {provider.isConnected && provider.isVisible ? "Hide" : "Show"}
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-border/50">
                          <ProviderConnectionModal
                            userId={userId || 0}
                            externalProviders={externalProviders}
                            trigger={
                              <Button variant="default" size="sm" className="w-full">
                                <RiAddLine className="h-4 w-4 mr-2" />
                                Connect New Provider
                              </Button>
                            }
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/30 flex-shrink-0">
            <div className="flex justify-center p-4">
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </div>
      </div>
      <CalendarCreationModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)}
        userId={userId}
        onCalendarCreated={async () => {
          if (userId) {
            await mutateCalendars()
          }
        }}
      />
    </div>
  )
}
