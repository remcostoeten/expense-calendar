"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import {
  RiSettings3Line,
  RiEyeLine,
  RiEyeOffLine,
  RiDeleteBinLine,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCalendarStore } from "@/stores/calendar-store"
import { COLOR_OPTIONS } from "@/lib/colors"
import { useUserSettings } from "@/server/api-hooks/use-user-settings"
import { useAuth } from "@/lib/auth/auth-context"


export function CalendarSettings() {
  const { calendars, updateCalendar, deleteCalendar, addCalendar, showCurrentTime, setShowCurrentTime } =
    useCalendarStore()
  const { user } = useAuth()
  const userSettingsHook = useUserSettings()

  const [isOpen, setIsOpen] = useState(false)
  const [isAddingCalendar, setIsAddingCalendar] = useState(false)
  const [newCalendarName, setNewCalendarName] = useState("")
  const [newCalendarColor, setNewCalendarColor] = useState("blue")

  const handleAddCalendar = () => {
    if (newCalendarName.trim()) {
      addCalendar({
        name: newCalendarName.trim(),
        color: newCalendarColor,
        isVisible: true,
        isActive: true,
      })
      setNewCalendarName("")
      setNewCalendarColor("blue")
      setIsAddingCalendar(false)
    }
  }

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      emerald: "bg-emerald-500",
      orange: "bg-orange-500",
      violet: "bg-violet-500",
      rose: "bg-rose-500",
      cyan: "bg-cyan-500",
      pink: "bg-pink-500",
      yellow: "bg-yellow-500",
    }
    return colorMap[color] || "bg-gray-500"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          aria-label="Calendar settings"
        >
          <RiSettings3Line className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiSettings3Line className="h-5 w-5" />
            Calendar Settings
          </DialogTitle>
          <DialogDescription>
            Manage your calendars, customize display options, and configure preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Show Current Time</Label>
                  <p className="text-xs text-muted-foreground">Display a red line indicating the current time</p>
                </div>
                <Switch 
                  checked={showCurrentTime} 
                  onCheckedChange={async (checked) => {
                    setShowCurrentTime(checked)
                    if (user?.id) {
                      await userSettingsHook.updateUserSettings.execute({ userId: user.id, settings: { showCurrentTime: checked } })
                    }
                  }} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Calendar Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calendar Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new calendar */}
              {isAddingCalendar ? (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="calendar-name">Calendar Name</Label>
                    <Input
                      id="calendar-name"
                      placeholder="Enter calendar name"
                      value={newCalendarName}
                      onChange={(e) => setNewCalendarName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCalendar()
                        } else if (e.key === "Escape") {
                          setIsAddingCalendar(false)
                          setNewCalendarName("")
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calendar-color">Color</Label>
                    <Select value={newCalendarColor} onValueChange={setNewCalendarColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${color.class}`} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddCalendar}>
                      <RiCheckLine className="h-4 w-4 mr-1" />
                      Add Calendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingCalendar(false)
                        setNewCalendarName("")
                      }}
                    >
                      <RiCloseLine className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsAddingCalendar(true)} className="w-full">
                  <RiAddLine className="h-4 w-4 mr-2" />
                  Add New Calendar
                </Button>
              )}

              {/* Existing calendars */}
              <div className="space-y-2">
                <Label>Your Calendars</Label>
                <div className="space-y-2">
                  {calendars.map((calendar) => (
                    <div
                      key={calendar.id}
                      className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-4 h-4 rounded-full", getColorClass(calendar.color))} />
                        <div>
                          <div className="font-medium">{calendar.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {calendar.color} • {calendar.isVisible ? "Visible" : "Hidden"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCalendar(calendar.id, { isVisible: !calendar.isVisible })}
                          aria-label={calendar.isVisible ? "Hide calendar" : "Show calendar"}
                        >
                          {calendar.isVisible ? (
                            <RiEyeLine className="h-4 w-4" />
                          ) : (
                            <RiEyeOffLine className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => deleteCalendar(calendar.id)}
                          aria-label="Delete calendar"
                        >
                          <RiDeleteBinLine className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
