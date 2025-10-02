import { sql } from "drizzle-orm";
import {
  pgTable,
  bigserial,
  text,
  integer,
  boolean,
  varchar,
  timestamp,
  char,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "./schema-helpers";
export { type TTimestamps, type TBaseEntity } from "./schema-helpers"

export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
  })
);

export type User = typeof users.$inferSelect;

export const calendars = pgTable(
  "calendars",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: char("color", { length: 7 }).default("#3b82f6").notNull(),
    userId: bigserial("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isDefault: boolean("is_default").default(false),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("calendars_user_idx").on(table.userId),
  })
);

export type Calendar = typeof calendars.$inferSelect;

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time")
      .notNull()
      .check(sql`end_time > start_time`),
    allDay: boolean("all_day").default(false),
    location: varchar("location", { length: 255 }),
    calendarId: bigserial("calendar_id", { mode: "number" })
      .notNull()
      .references(() => calendars.id, { onDelete: "cascade" }),
    userId: bigserial("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recurrenceRule: text("recurrence_rule"),
    ...timestamps,
  },
  (table) => ({
    calendarIdx: index("events_calendar_idx").on(table.calendarId),
    userIdx: index("events_user_idx").on(table.userId),
    timeIdx: index("events_time_idx").on(table.startTime, table.endTime),
  })
);

export type Event = typeof events.$inferSelect;

export const eventReminders = pgTable(
  "event_reminders",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    eventId: bigserial("event_id", { mode: "number" })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    minutesBefore: integer("minutes_before").notNull(),
    ...timestamps,
  },
  (table) => ({
    eventIdx: index("event_reminders_event_idx").on(table.eventId),
  })
);

export type EventReminder = typeof eventReminders.$inferSelect;

export const userSettings = pgTable("user_settings", {
  userId: bigserial("user_id", { mode: "number" })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  showCurrentTime: boolean("show_current_time").default(true),
  showRecurringEvents: boolean("show_recurring_events").default(true),
  defaultView: varchar("default_view", { length: 20 }).default("week"),
  ...timestamps,
});

export type UserSettings = typeof userSettings.$inferSelect;

export const defaultCalendarTemplates = pgTable(
  "default_calendar_templates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
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

export type DefaultCalendarTemplate = typeof defaultCalendarTemplates.$inferSelect;

// Provider integration tables
export const userIntegrations = pgTable("user_integrations", {
  userId: bigserial("user_id", { mode: "number" }).notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // "microsoft", "apple", "google"
  accessToken: text("access_token"),   // used by Google/Microsoft
  refreshToken: text("refresh_token"),
  appPassword: text("app_password"),   // used by Apple iCloud
  expiresAt: timestamp("expires_at"),
  ...timestamps,
}, (table) => ({
  userProviderIdx: index("user_integrations_user_provider_idx").on(table.userId, table.provider),
}))

export const calendarIntegrations = pgTable("calendar_integrations", {
  calendarId: bigserial("calendar_id", { mode: "number" }).notNull().references(() => calendars.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(), // MS calendarId / CalDAV URL / Google calendarId
  ...timestamps,
}, (table) => ({
  calendarProviderIdx: index("calendar_integrations_calendar_provider_idx").on(table.calendarId, table.provider),
  providerExternalIdx: index("calendar_integrations_provider_external_idx").on(table.provider, table.externalId),
}))

export const eventIntegrations = pgTable("event_integrations", {
  eventId: bigserial("event_id", { mode: "number" }).notNull().references(() => events.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(), // eventId / CalDAV UID
  ...timestamps,
}, (table) => ({
  eventProviderIdx: index("event_integrations_event_provider_idx").on(table.eventId, table.provider),
  providerExternalIdx: index("event_integrations_provider_external_idx").on(table.provider, table.externalId),
}))

// Export types for provider integrations
export type UserIntegration = typeof userIntegrations.$inferSelect
export type NewUserIntegration = typeof userIntegrations.$inferInsert
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect
export type NewCalendarIntegration = typeof calendarIntegrations.$inferInsert
export type EventIntegration = typeof eventIntegrations.$inferSelect
export type NewEventIntegration = typeof eventIntegrations.$inferInsert
