"use client"

import { useEffect, useState } from "react"
import { useCalendarStore } from "@/stores/calendar-store"
import { getCalendarsAction } from "../server/actions/get-calendars-action"
import { getAllUserEventsAction } from "../server/actions/get-all-user-events-action"
import { getUserSettingsAction } from "../server/actions/get-user-settings-action"
import { useCalendar } from "./use-calendar"
import { useCalendarManagement } from "@/server/api-hooks/use-calendar-management"
import type { Event, Calendar, UserSettings } from "@/server/schema"

export type CalendarData = {
  events: Event[]
  calendars: Calendar[]
  userSettings: UserSettings | null
  isLoading: boolean
  error: string | null
}

export function useCalendarData(userId: number) {
  const { setCalendars, setEvents, setShowCurrentTime, setShowRecurringEvents } = useCalendarStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEventsState] = useState<Event[]>([])
  const [calendars, setCalendarsState] = useState<Calendar[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)

  // Initialize calendar and management hooks with current data
  const calendar = useCalendar(events, calendars)
  const calendarManagement = useCalendarManagement(calendars)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load calendars
        const calendarsResult = await getCalendarsAction(userId)
        if (calendarsResult.success && calendarsResult.data) {
          setCalendarsState(calendarsResult.data)
          setCalendars(calendarsResult.data)
        }

        // Load events
        const eventsResult = await getAllUserEventsAction(userId)
        if (eventsResult.success && eventsResult.data) {
          setEventsState(eventsResult.data)
          setEvents(eventsResult.data)
        }

        // Load user settings
        const settingsResult = await getUserSettingsAction(userId)
        if (settingsResult.success && settingsResult.data) {
          setUserSettings(settingsResult.data)
          setShowCurrentTime(settingsResult.data.showCurrentTime ?? true)
          setShowRecurringEvents(settingsResult.data.showRecurringEvents ?? true)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load calendar data"
        setError(errorMessage)
        console.error("Error loading calendar data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId && userId > 0) {
      loadData()
    }
  }, [userId, setCalendars, setEvents, setShowCurrentTime, setShowRecurringEvents])

  // Update local state when optimistic data changes
  useEffect(() => {
    if (calendar.createEvent.optimisticData) {
      setEventsState(calendar.createEvent.optimisticData)
    }
  }, [calendar.createEvent.optimisticData])

  useEffect(() => {
    if (calendar.updateEvent.optimisticData) {
      setEventsState(calendar.updateEvent.optimisticData)
    }
  }, [calendar.updateEvent.optimisticData])

  useEffect(() => {
    if (calendar.deleteEvent.optimisticData) {
      setEventsState(calendar.deleteEvent.optimisticData)
    }
  }, [calendar.deleteEvent.optimisticData])

  useEffect(() => {
    if (calendar.createCalendar.optimisticData) {
      setCalendarsState(calendar.createCalendar.optimisticData)
    }
  }, [calendar.createCalendar.optimisticData])

  useEffect(() => {
    if (calendarManagement.updateCalendar.optimisticData) {
      setCalendarsState(calendarManagement.updateCalendar.optimisticData)
    }
  }, [calendarManagement.updateCalendar.optimisticData])

  useEffect(() => {
    if (calendarManagement.deleteCalendar.optimisticData) {
      setCalendarsState(calendarManagement.deleteCalendar.optimisticData)
    }
  }, [calendarManagement.deleteCalendar.optimisticData])

  useEffect(() => {
    if (calendarManagement.reorderCalendars.optimisticData) {
      setCalendarsState(calendarManagement.reorderCalendars.optimisticData)
    }
  }, [calendarManagement.reorderCalendars.optimisticData])

  return {
    events,
    calendars,
    userSettings,
    isLoading,
    error,
    calendar,
    calendarManagement,
  }
}
