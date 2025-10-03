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
import { COLOR_OPTIONS } from "@/lib/colors"

type TProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (calendarColor: string) => void
  userId?: number
  onCalendarCreated?: () => void
}


export function CalendarCreationModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  onCalendarCreated,
}: TProps) {
  const { addCalendar, calendars } = useCalendarStore()
  const [name, setName] = useState("")
  const [color, setColor] = useState("blue")
  const createCalendar = useCreateCalendar({
    onSuccess: (calendar) => {
      onCalendarCreated?.()
        const colorName = COLOR_OPTIONS.find(opt => opt.hex === calendar.color)?.value || "blue"
      onSuccess?.(colorName)
    },
    onError: (error) => {
      console.error("Failed to create calendar:", error)
    },
  })

  const usedColors = calendars.map((cal) => cal.color)
  const availableColors = COLOR_OPTIONS.filter((option) => !usedColors.includes(option.value))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) {
      if (userId) {
        const selectedColor = COLOR_OPTIONS.find((opt) => opt.value === color)
        await createCalendar.execute({
          userId,
          name: name.trim(),
          color: selectedColor?.hex || "#3b82f6",
          isDefault: false,
        })
        setName("")
        setColor("blue")
        onClose()
      } else {
        const newCalendar = {
          name: name.trim(),
          color,
          isVisible: true,
          isActive: true,
        }
        addCalendar(newCalendar)
        onSuccess?.(color)
        setName("")
        setColor("blue")
        onClose()
      }
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
                  {(availableColors.length > 0 ? availableColors : COLOR_OPTIONS).map((option) => (
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
