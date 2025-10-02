import type { Calendar as DbCalendar } from "@/server/schema"
import type { Calendar as StoreCalendar } from "@/stores/calendar-store"

const COLOR_MAP: Record<string, string> = {
  "#10b981": "emerald",
  "#f97316": "orange",
  "#8b5cf6": "violet", 
  "#3b82f6": "blue",
  "#f43f5e": "rose",
  "#06b6d4": "cyan",
  "#ec4899": "pink",
  "#ef4444": "red",
  "#f59e0b": "amber",
  "#14b8a6": "teal",
  "#6366f1": "indigo",
  "#d946ef": "purple",
}

const DEFAULT_CALENDAR_COLOR = "#3b82f6"

export function convertDbCalendarsToStore(dbCalendars: DbCalendar[]): StoreCalendar[] {
  return dbCalendars.map((calendar) => ({
    id: calendar.id.toString(),
    name: calendar.name,
    color: COLOR_MAP[calendar.color || DEFAULT_CALENDAR_COLOR] || "blue",
    isVisible: true, // Default to visible, could be stored in user preferences later
    isActive: true,
  }))
}

// Default calendars to create when user has none
const DEFAULT_CALENDARS = [
  { name: "Personal", color: "#10b981", description: "Personal events and appointments" },
  { name: "Work", color: "#3b82f6", description: "Work meetings and tasks" },
  { name: "Family", color: "#f97316", description: "Family events and gatherings" },
  { name: "Health", color: "#8b5cf6", description: "Medical appointments and fitness" },
  { name: "Projects", color: "#f43f5e", description: "Side projects and learning" },
] as const

export function getDefaultCalendars(userId: number): Omit<DbCalendar, "id" | "createdAt" | "updatedAt">[] {
  return DEFAULT_CALENDARS.map((calendar, index) => ({
    name: calendar.name,
    color: calendar.color,
    description: calendar.description,
    userId,
    isDefault: index === 0, // First calendar is default
  }))
}