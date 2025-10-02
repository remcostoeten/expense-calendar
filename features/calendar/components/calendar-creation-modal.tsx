"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCalendarStore } from "@/stores/calendar-store"
import { useCreateCalendar } from "@/server/api-hooks/use-calendar"

interface CalendarCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (calendarColor: string) => void
  userId?: number
  onCalendarCreated?: () => void
}

const colorOptions = [
  { value: "blue", label: "Blue", class: "bg-blue-500", hex: "#3b82f6" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500", hex: "#10b981" },
  { value: "orange", label: "Orange", class: "bg-orange-500", hex: "#f97316" },
  { value: "violet", label: "Violet", class: "bg-violet-500", hex: "#8b5cf6" },
  { value: "rose", label: "Rose", class: "bg-rose-500", hex: "#f43f5e" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-500", hex: "#06b6d4" },
  { value: "pink", label: "Pink", class: "bg-pink-500", hex: "#ec4899" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500", hex: "#eab308" },
]

export function CalendarCreationModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  onCalendarCreated,
}: CalendarCreationModalProps) {
  const { addCalendar, calendars } = useCalendarStore()
  const [name, setName] = useState("")
  const [color, setColor] = useState("blue")
  const createCalendar = useCreateCalendar({
    onSuccess: () => {
      onCalendarCreated?.()
    },
    onError: (error) => {
      console.error("[v0] Failed to create calendar:", error)
    },
  })

  const usedColors = calendars.map((cal) => cal.color)
  const availableColors = colorOptions.filter((option) => !usedColors.includes(option.value))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      if (userId) {
        const selectedColor = colorOptions.find((opt) => opt.value === color)
        await createCalendar.execute({
          userId,
          name: name.trim(),
          color: selectedColor?.hex || "#3b82f6",
          isDefault: false,
        })
      } else {
        const newCalendar = {
          name: name.trim(),
          color,
          isVisible: true,
          isActive: true,
        }
        addCalendar(newCalendar)
      }

      onSuccess?.(color)
      setName("")
      setColor("blue")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Calendar</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-name">Calendar Name *</Label>
            <Input
              id="calendar-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter calendar name"
              required
              disabled={createCalendar.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calendar-color">Color</Label>
            <Select value={color} onValueChange={setColor} disabled={createCalendar.isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(availableColors.length > 0 ? availableColors : colorOptions).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${option.class}`} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {createCalendar.error && <p className="text-sm text-destructive">{createCalendar.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={createCalendar.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCalendar.isPending}>
              {createCalendar.isPending ? "Creating..." : "Create Calendar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
