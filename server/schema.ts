import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  varchar,
  timestamp,
  char,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { timestamps } from "./schema-helpers";
import { sql } from "drizzle-orm";

// Import shared schema helpers
export { timestamps, type TTimestamps, type TBaseEntity } from "./schema-helpers"

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
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
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: char("color", { length: 7 }).default("#3b82f6").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isDefault: boolean("is_default").default(false),
    sortOrder: integer("sort_order").default(0),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("calendars_user_idx").on(table.userId),
    sortIdx: index("calendars_sort_idx").on(table.sortOrder),
  })
);

export type Calendar = typeof calendars.$inferSelect;

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
    calendarId: integer("calendar_id")
      .notNull()
      .references(() => calendars.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
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

export type Event = typeof events.$inferSelect;

export const eventReminders = pgTable(
  "event_reminders",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
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
  userId: integer("user_id")
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

export type DefaultCalendarTemplate = typeof defaultCalendarTemplates.$inferSelect;

// Provider integration tables
export const userIntegrations = pgTable("user_integrations", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  appPassword: text("app_password"),
  expiresAt: timestamp("expires_at"),
  ...timestamps,
}, (table) => ({
  userProviderIdx: index("user_integrations_user_provider_idx").on(table.userId, table.provider),
}));

export const calendarIntegrations = pgTable("calendar_integrations", {
  calendarId: integer("calendar_id").notNull().references(() => calendars.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  ...timestamps,
}, (table) => ({
  calendarProviderIdx: index("calendar_integrations_calendar_provider_idx").on(table.calendarId, table.provider),
  providerExternalIdx: index("calendar_integrations_provider_external_idx").on(table.provider, table.externalId),
}));

export const eventIntegrations = pgTable("event_integrations", {
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  ...timestamps,
}, (table) => ({
  eventProviderIdx: index("event_integrations_event_provider_idx").on(table.eventId, table.provider),
  providerExternalIdx: index("event_integrations_provider_external_idx").on(table.provider, table.externalId),
}));

export type UserIntegration = typeof userIntegrations.$inferSelect
export type NewUserIntegration = typeof userIntegrations.$inferInsert
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect
export type NewCalendarIntegration = typeof calendarIntegrations.$inferInsert
export type EventIntegration = typeof eventIntegrations.$inferSelect
export type NewEventIntegration = typeof eventIntegrations.$inferInsert