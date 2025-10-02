import { pgTable, serial, text, integer, boolean, varchar, timestamp } from "drizzle-orm/pg-core"
import { timestamps } from "./schema-helpers"

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  ...timestamps,
})

export type User = typeof users.$inferSelect

// Calendar tables
export const calendars = pgTable("calendars", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isDefault: boolean("is_default").default(false),
  ...timestamps,
})

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  allDay: boolean("all_day").default(false),
  location: varchar("location", { length: 255 }),
  calendarId: integer("calendar_id")
    .notNull()
    .references(() => calendars.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestamps,
})

export const eventReminders = pgTable("event_reminders", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  minutesBefore: integer("minutes_before").notNull(),
  ...timestamps,
})

// User settings table
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  showCurrentTime: boolean("show_current_time").default(true),
  showRecurringEvents: boolean("show_recurring_events").default(true),
  defaultView: varchar("default_view", { length: 20 }).default("week"),
  ...timestamps,
})

export type Calendar = typeof calendars.$inferSelect
export type Event = typeof events.$inferSelect
export type EventReminder = typeof eventReminders.$inferSelect
export type UserSettings = typeof userSettings.$inferSelect
