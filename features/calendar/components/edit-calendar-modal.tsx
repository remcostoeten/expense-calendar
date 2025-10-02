"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Calendar } from "@/stores/calendar-store"

type TProps = {
  calendar: Calendar
  isOpen: boolean
  onClose: () => void
  onSave: (calendar: Calendar) => void
}

const COLOR_OPTIONS = [
  { value: "emerald", label: "Emerald", hex: "#10b981" },
  { value: "blue", label: "Blue", hex: "#3b82f6" },
  { value: "orange", label: "Orange", hex: "#f97316" },
  { value: "violet", label: "Violet", hex: "#8b5cf6" },
  { value: "rose", label: "Rose", hex: "#f43f5e" },
  { value: "cyan", label: "Cyan", hex: "#06b6d4" },
  { value: "pink", label: "Pink", hex: "#ec4899" },
  { value: "red", label: "Red", hex: "#ef4444" },
  { value: "amber", label: "Amber", hex: "#f59e0b" },
  { value: "teal", label: "Teal", hex: "#14b8a6" },
  { value: "indigo", label: "Indigo", hex: "#6366f1" },
  { value: "purple", label: "Purple", hex: "#d946ef" },
]

export function EditCalendarModal({ calendar, isOpen, onClose, onSave }: TProps) {
  const [name, setName] = useState(calendar.name)
  const [color, setColor] = useState(calendar.color)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setName(calendar.name)
    setColor(calendar.color)
  }, [calendar])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) return

    setIsLoading(true)

    try {
      const updatedCalendar: Calendar = {
        ...calendar,
        name: name.trim(),
        color,
      }

      onSave(updatedCalendar)
    } catch (error) {
      console.error("Error updating calendar:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Calendar</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Calendar Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter calendar name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={setColor} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((colorOption) => (
                  <SelectItem key={colorOption.value} value={colorOption.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: colorOption.hex }}
                      />
                      {colorOption.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
