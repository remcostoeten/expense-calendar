"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCalendarStore } from "@/stores/calendar-store"
import { CalendarCreationModal } from "./calendar-creation-modal"
import type { TCalendarEvent } from "./event-calendar"

interface EventCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<TCalendarEvent, "id">) => void
  initialStart?: Date
  initialEnd?: Date
  userId?: number
  onCalendarCreated?: () => void
}

export function EventCreationModal({
  isOpen,
  onClose,
  onSave,
  initialStart,
  initialEnd,
  userId,
  onCalendarCreated,
}: EventCreationModalProps) {
  const { calendars } = useCalendarStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [color, setColor] = useState("blue")
  const [allDay, setAllDay] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly")
  const [interval, setInterval] = useState(1)
  const [recurrenceEndType, setRecurrenceEndType] = useState<"never" | "date" | "count">("never")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [recurrenceCount, setRecurrenceCount] = useState(10)

  useEffect(() => {
    if (initialStart) {
      setStartDate(format(initialStart, "yyyy-MM-dd"))
      setStartTime(format(initialStart, "HH:mm"))
    }
    if (initialEnd) {
      setEndDate(format(initialEnd, "yyyy-MM-dd"))
      setEndTime(format(initialEnd, "HH:mm"))
    }
  }, [initialStart, initialEnd])

  useEffect(() => {
    if (calendars.length > 0) {
      setColor(calendars[0].color)
    }
  }, [calendars])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const start = allDay ? new Date(`${startDate}T00:00:00`) : new Date(`${startDate}T${startTime}:00`)

    const end = allDay ? new Date(`${endDate || startDate}T23:59:59`) : new Date(`${endDate}T${endTime}:00`)

    const eventData: Omit<TCalendarEvent, "id"> = {
      title,
      description: description || undefined,
      location: location || undefined,
      start,
      end,
      color,
      allDay,
      isRecurring,
      recurrenceRule: isRecurring
        ? {
            frequency,
            interval,
            endDate: recurrenceEndType === "date" ? new Date(recurrenceEndDate) : undefined,
            count: recurrenceEndType === "count" ? recurrenceCount : undefined,
          }
        : undefined,
    }

    onSave(eventData)

    // Reset form
    setTitle("")
    setDescription("")
    setLocation("")
    setStartDate("")
    setStartTime("")
    setEndDate("")
    setEndTime("")
    setAllDay(false)
    setIsRecurring(false)
    setFrequency("weekly")
    setInterval(1)
    setRecurrenceEndType("never")
    setRecurrenceEndDate("")
    setRecurrenceCount(10)
    onClose()
  }

  const availableCalendars = calendars.filter((cal) => cal.isVisible)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Event location"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} />
              <Label htmlFor="all-day">All day</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              {!allDay && (
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time *</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              {!allDay && (
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time *</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                <Label htmlFor="recurring">Recurring event</Label>
              </div>

              {isRecurring && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={frequency}
                        onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => setFrequency(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interval">Every</Label>
                      <Input
                        id="interval"
                        type="number"
                        min="1"
                        max="99"
                        value={interval}
                        onChange={(e) => setInterval(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ends</Label>
                    <Select
                      value={recurrenceEndType}
                      onValueChange={(value: "never" | "date" | "count") => setRecurrenceEndType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="date">On date</SelectItem>
                        <SelectItem value="count">After occurrences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrenceEndType === "date" && (
                    <div className="space-y-2">
                      <Label htmlFor="recurrence-end-date">End Date</Label>
                      <Input
                        id="recurrence-end-date"
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      />
                    </div>
                  )}

                  {recurrenceEndType === "count" && (
                    <div className="space-y-2">
                      <Label htmlFor="recurrence-count">Number of occurrences</Label>
                      <Input
                        id="recurrence-count"
                        type="number"
                        min="1"
                        max="999"
                        value={recurrenceCount}
                        onChange={(e) => setRecurrenceCount(Number.parseInt(e.target.value) || 10)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-calendar">Calendar</Label>
              <div className="flex gap-2">
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCalendars.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.color}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
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
                          {calendar.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCalendarModalOpen(true)}>
                  New
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CalendarCreationModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onSuccess={(newColor) => setColor(newColor)}
        userId={userId}
        onCalendarCreated={onCalendarCreated}
      />
    </>
  )
}
