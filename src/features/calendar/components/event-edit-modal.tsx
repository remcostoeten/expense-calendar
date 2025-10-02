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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCalendarStore } from "@/stores/calendar-store"
import type { TCalendarEvent } from "./event-calendar"

interface EventEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: TCalendarEvent) => void
  onDelete: (eventId: string) => void
  event: TCalendarEvent | null
}

export function EventEditModal({ isOpen, onClose, onSave, onDelete, event }: EventEditModalProps) {
  const { calendars } = useCalendarStore()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [selectedCalendarId, setSelectedCalendarId] = useState("")
  const [allDay, setAllDay] = useState(false)

  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly")
  const [interval, setInterval] = useState(1)
  const [recurrenceEndType, setRecurrenceEndType] = useState<"never" | "date" | "count">("never")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [recurrenceCount, setRecurrenceCount] = useState(10)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setLocation(event.location || "")
      setStartDate(format(event.start, "yyyy-MM-dd"))
      setStartTime(format(event.start, "HH:mm"))
      setEndDate(format(event.end, "yyyy-MM-dd"))
      setEndTime(format(event.end, "HH:mm"))
      // Find calendar by color to get the ID
      const calendar = calendars.find(cal => cal.color === event.color)
      setSelectedCalendarId(calendar?.id || "")
      setAllDay(event.allDay || false)

      setIsRecurring(event.isRecurring || false)
      if (event.recurrenceRule) {
        setFrequency(event.recurrenceRule.frequency)
        setInterval(event.recurrenceRule.interval)
        if (event.recurrenceRule.endDate) {
          setRecurrenceEndType("date")
          setRecurrenceEndDate(format(event.recurrenceRule.endDate, "yyyy-MM-dd"))
        } else if (event.recurrenceRule.count) {
          setRecurrenceEndType("count")
          setRecurrenceCount(event.recurrenceRule.count)
        } else {
          setRecurrenceEndType("never")
        }
      }
    }
  }, [event])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    const start = allDay ? new Date(`${startDate}T00:00:00`) : new Date(`${startDate}T${startTime}:00`)

    const end = allDay ? new Date(`${endDate || startDate}T23:59:59`) : new Date(`${endDate}T${endTime}:00`)

    const selectedCalendar = calendars.find(cal => cal.id === selectedCalendarId)
    const color = selectedCalendar?.color || event.color

    onSave({
      ...event,
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
    })

    onClose()
  }

  const handleDelete = () => {
    if (event) {
      onDelete(event.id)
      onClose()
    }
  }

  const availableCalendars = calendars.filter((cal) => cal.isVisible)

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
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
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
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
            <Select value={selectedCalendarId} onValueChange={setSelectedCalendarId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCalendars.map((calendar) => (
                  <SelectItem key={calendar.id} value={calendar.id.toString()}>
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
          </div>

          <div className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Delete Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{event.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
