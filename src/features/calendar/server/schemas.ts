import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  varchar,
  timestamp,
  char,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestamps } from "@/server/schema-helpers";

export const calendars = pgTable(
  "calendars",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: char("color", { length: 7 }).default("#3b82f6").notNull(),
    userId: integer("user_id").notNull(), // Will be properly referenced in main schema
    isDefault: boolean("is_default").default(false),
    sortOrder: integer("sort_order").default(0),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("calendars_user_idx").on(table.userId),
    sortIdx: index("calendars_sort_idx").on(table.sortOrder),
  })
);

export type TCalendar = typeof calendars.$inferSelect;

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    allDay: boolean("all_day").default(false),
    location: varchar("location", { length: 255 }),
    calendarId: integer("calendar_id").notNull(), // Will be properly referenced in main schema
    userId: integer("user_id").notNull(), // Will be properly referenced in main schema
    recurrenceRule: text("recurrence_rule"),
    ...timestamps,
  },
  (table) => ({
    calendarIdx: index("events_calendar_idx").on(table.calendarId),
    userIdx: index("events_user_idx").on(table.userId),
    timeIdx: index("events_time_idx").on(table.startTime, table.endTime),
    endTimeCheck: check("end_time_after_start_time", sql`${table.endTime} > ${table.startTime}`),
  })
);

export type TEvent = typeof events.$inferSelect;

export const eventReminders = pgTable(
  "event_reminders",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").notNull(), // Will be properly referenced in main schema
    minutesBefore: integer("minutes_before").notNull(),
    ...timestamps,
  },
  (table) => ({
    eventIdx: index("event_reminders_event_idx").on(table.eventId),
  })
);

export type TEventReminder = typeof eventReminders.$inferSelect;

export const defaultCalendarTemplates = pgTable(
  "default_calendar_templates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: char("color", { length: 7 }).notNull().default("#3b82f6"),
    isDefault: boolean("is_default").default(false),
    sortOrder: integer("sort_order").default(0),
    ...timestamps,
  },
  (table) => ({
    sortIdx: index("default_calendar_templates_sort_idx").on(table.sortOrder),
  })
);

export type TDefaultCalendarTemplate = typeof defaultCalendarTemplates.$inferSelect;
