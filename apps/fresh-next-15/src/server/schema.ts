/**
 * @description
 * The main entry point, only responsible for re-exporting individual schemas
 *
 * @author Remco Stoeten
 */

import {
    bigint,
    boolean,
    date,
    decimal,
    index,
    integer,
    jsonb,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    char,
    uniqueIndex,
    check
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// User tables (from authentication-example)
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name'),
    email: text('email').unique(),
    vehicle: text('vehicle', { enum: ['car', 'public transport'] }),
    kmRate: decimal('km_rate', { precision: 4, scale: 2 }).default('0.19'),
    homeAddress: text('home_address'),
    homeLatitude: decimal('home_latitude', { precision: 10, scale: 8 }),
    homeLongitude: decimal('home_longitude', { precision: 11, scale: 8 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const userProfiles = pgTable('user_profiles', {
    id: bigint('id', { mode: 'bigint' }).primaryKey().generatedByDefaultAsIdentity(),
    userId: text('user_id').notNull().unique(),
    displayName: text('display_name'),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    location: text('location'),
    website: text('website'),
    oauthProviders: jsonb('oauth_providers').$type<Record<string, unknown>>(),
    preferences: jsonb('preferences').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

// Trip/expense related tables (from authentication-example)
export const destinations = pgTable(
    'destinations',
    {
        id: serial('id').primaryKey(),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id),
        name: varchar('name', { length: 100 }).notNull(),
        address: text('address').notNull(),
        latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
        longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
        isDefaultWork: boolean('is_default_work').default(false),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        userIdIdx: index('destinations_user_id_idx').on(table.userId),
        defaultWorkIdx: index('destinations_default_work_idx').on(table.userId, table.isDefaultWork)
    })
)

export const tripTemplates = pgTable(
    'trip_templates',
    {
        id: serial('id').primaryKey(),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id),
        name: varchar('name', { length: 100 }).notNull(),
        fromDestinationId: integer('from_destination_id').references(() => destinations.id),
        toDestinationId: integer('to_destination_id').references(() => destinations.id),
        fromCustomAddress: text('from_custom_address'),
        toCustomAddress: text('to_custom_address'),
        cachedDistanceKm: decimal('cached_distance_km', { precision: 8, scale: 2 }),
        defaultTitle: varchar('default_title', { length: 200 }),
        defaultDescription: text('default_description'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        userIdIdx: index('trip_templates_user_id_idx').on(table.userId)
    })
)

export const trips = pgTable(
    'trips',
    {
        id: serial('id').primaryKey(),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id),
        templateId: integer('template_id').references(() => tripTemplates.id),
        title: varchar('title', { length: 200 }).notNull(),
        description: text('description'),
        tripDate: date('trip_date').notNull(),
        fromAddress: text('from_address').notNull(),
        toAddress: text('to_address').notNull(),
        fromLatitude: decimal('from_latitude', { precision: 10, scale: 8 }).notNull(),
        fromLongitude: decimal('from_longitude', { precision: 11, scale: 8 }).notNull(),
        toLatitude: decimal('to_latitude', { precision: 10, scale: 8 }).notNull(),
        toLongitude: decimal('to_longitude', { precision: 11, scale: 8 }).notNull(),
        distanceKm: decimal('distance_km', { precision: 8, scale: 2 }).notNull(),
        calculatedAmount: decimal('calculated_amount', { precision: 8, scale: 2 }).notNull(),
        kmRateUsed: decimal('km_rate_used', { precision: 4, scale: 2 }).notNull(),
        apiResponseData: jsonb('api_response_data'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull()
    },
    table => ({
        userIdIdx: index('trips_user_id_idx').on(table.userId),
        tripDateIdx: index('trips_trip_date_idx').on(table.userId, table.tripDate),
        templateIdIdx: index('trips_template_id_idx').on(table.templateId)
    })
)

// Calendar tables (from current app)
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
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("calendars_user_idx").on(table.userId),
    sortIdx: index("calendars_sort_idx").on(table.sortOrder),
  })
);

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
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    calendarIdx: index("events_calendar_idx").on(table.calendarId),
    userIdx: index("events_user_idx").on(table.userId),
    timeIdx: index("events_time_idx").on(table.startTime, table.endTime),
    endTimeCheck: check("end_time_after_start_time", sql`${table.endTime} > ${table.startTime}`),
  })
);

export const eventReminders = pgTable(
  "event_reminders",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    minutesBefore: integer("minutes_before").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    eventIdx: index("event_reminders_event_idx").on(table.eventId),
  })
);

export const userSettings = pgTable("user_settings", {
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  showCurrentTime: boolean("show_current_time").default(true),
  showRecurringEvents: boolean("show_recurring_events").default(true),
  defaultView: varchar("default_view", { length: 20 }).default("week"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const defaultCalendarTemplates = pgTable(
  "default_calendar_templates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    color: char("color", { length: 7 }).notNull().default("#3b82f6"),
    isDefault: boolean("is_default").default(false),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    sortIdx: index("default_calendar_templates_sort_idx").on(table.sortOrder),
  })
);

// Provider integration tables
export const userIntegrations = pgTable("user_integrations", {
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  appPassword: text("app_password"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userProviderIdx: index("user_integrations_user_provider_idx").on(table.userId, table.provider),
}));

export const calendarIntegrations = pgTable("calendar_integrations", {
  calendarId: integer("calendar_id").notNull().references(() => calendars.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  calendarProviderIdx: index("calendar_integrations_calendar_provider_idx").on(table.calendarId, table.provider),
  providerExternalIdx: index("calendar_integrations_provider_external_idx").on(table.provider, table.externalId),
}));

export const eventIntegrations = pgTable("event_integrations", {
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  eventProviderIdx: index("event_integrations_event_provider_idx").on(table.eventId, table.provider),
  providerExternalIdx: index("event_integrations_provider_external_idx").on(table.provider, table.externalId),
}));

// Type exports
export type TUserDrizzle = typeof users.$inferSelect
export type TInsertUserDrizzle = typeof users.$inferInsert

export type TDestinationDrizzle = typeof destinations.$inferSelect
export type TInsertDestinationDrizzle = typeof destinations.$inferInsert
export type TTripTemplateDrizzle = typeof tripTemplates.$inferSelect
export type TInsertTripTemplateDrizzle = typeof tripTemplates.$inferInsert
export type TTripDrizzle = typeof trips.$inferSelect
export type TInsertTripDrizzle = typeof trips.$inferInsert

export type TCalendar = typeof calendars.$inferSelect
export type TEvent = typeof events.$inferSelect
export type TEventReminder = typeof eventReminders.$inferSelect
export type TUserSettings = typeof userSettings.$inferSelect
export type TDefaultCalendarTemplate = typeof defaultCalendarTemplates.$inferSelect
export type TUserIntegration = typeof userIntegrations.$inferSelect
export type TNewUserIntegration = typeof userIntegrations.$inferInsert
export type TCalendarIntegration = typeof calendarIntegrations.$inferSelect
export type TNewCalendarIntegration = typeof calendarIntegrations.$inferInsert
export type TEventIntegration = typeof eventIntegrations.$inferSelect
export type TNewEventIntegration = typeof eventIntegrations.$inferInsert
