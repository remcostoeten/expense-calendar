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
  bigint,
  decimal,
  jsonb,
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
});

export const commuteProfiles = pgTable('commute_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  
  // Commute method
  commuteMethod: text('commute_method').notNull(), // 'car', 'public_transport', 'walking', 'bike'
  kmAllowance: decimal('km_allowance', { precision: 4, scale: 2 }).default('0.23'), // € per km
  publicTransportCost: decimal('public_transport_cost', { precision: 6, scale: 2 }), // Monthly subscription cost
  
  // Home office allowance
  homeOfficeAllowance: decimal('home_office_allowance', { precision: 4, scale: 2 }).default('2.00'), // € per day
  
  // Addresses
  homeAddress: text('home_address').notNull(), // Full address string
  homePostalCode: varchar('home_postal_code', { length: 10 }).notNull(),
  homeCity: text('home_city').notNull(),
  homeStreet: text('home_street').notNull(),
  
  officeAddress: text('office_address').notNull(),
  officePostalCode: varchar('office_postal_code', { length: 10 }).notNull(),
  officeCity: text('office_city').notNull(),
  officeStreet: text('office_street').notNull(),
  
  // Distance (calculated)
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  
  // Office days
  hasFixedOfficeDays: boolean('has_fixed_office_days').default(false),
  fixedOfficeDays: jsonb('fixed_office_days').$type<number[]>(), // Array of day numbers (0=Sunday, 1=Monday, etc.)
  
  // Home office days
  hasHomeOfficeAllowance: boolean('has_home_office_allowance').default(false),
  homeOfficeDays: jsonb('home_office_days').$type<number[]>(), // Array of day numbers
  
  // Onboarding status
  onboardingCompleted: boolean('onboarding_completed').default(false),
  
  ...timestamps,
});

export type CommuteProfile = typeof commuteProfiles.$inferSelect;

export const commuteDeclarations = pgTable('commute_declarations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  
  // Work location
  workLocation: text('work_location').notNull(), // 'office', 'home'
  
  // Commute details
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  commuteMethod: text('commute_method').notNull(),
  
  // Allowances
  kmAllowanceAmount: decimal('km_allowance_amount', { precision: 6, scale: 2 }),
  homeOfficeAllowanceAmount: decimal('home_office_allowance_amount', { precision: 6, scale: 2 }),
  totalAllowance: decimal('total_allowance', { precision: 6, scale: 2 }).notNull(),
  
  // Notes
  notes: text('notes'),
  
  ...timestamps,
});

export type CommuteDeclaration = typeof commuteDeclarations.$inferSelect;

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

// Trip Templates
export const tripTemplates = pgTable('trip_templates', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  
  // Route
  fromAddress: text('from_address').notNull(),
  fromLatitude: decimal('from_latitude', { precision: 10, scale: 8 }),
  fromLongitude: decimal('from_longitude', { precision: 11, scale: 8 }),
  toAddress: text('to_address').notNull(),
  toLatitude: decimal('to_latitude', { precision: 10, scale: 8 }),
  toLongitude: decimal('to_longitude', { precision: 11, scale: 8 }),
  
  // Trip details
  commuteMethod: text('commute_method').notNull(), // 'car', 'public_transport', 'walking', 'bike'
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  estimatedDurationMinutes: integer('estimated_duration_minutes'),
  
  // Allowances
  kmAllowance: decimal('km_allowance', { precision: 4, scale: 2 }).default('0.23'),
  publicTransportCost: decimal('public_transport_cost', { precision: 6, scale: 2 }),
  homeOfficeAllowance: decimal('home_office_allowance', { precision: 4, scale: 2 }),
  
  // Recurring settings
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: text('recurrence_pattern'), // 'daily', 'weekly', 'weekdays', 'custom'
  recurrenceDays: jsonb('recurrence_days').$type<number[]>(), // Array of day numbers (0=Sunday)
  recurrenceStartDate: timestamp('recurrence_start_date', { withTimezone: true }),
  recurrenceEndDate: timestamp('recurrence_end_date', { withTimezone: true }),
  
  // Calendar integration
  addToCalendar: boolean('add_to_calendar').default(false),
  calendarId: integer('calendar_id').references(() => calendars.id),
  eventTitle: text('event_title'),
  eventDescription: text('event_description'),
  
  isActive: boolean('is_active').default(true),
  
  ...timestamps,
}, (table) => ({
  userIdx: index('trip_templates_user_idx').on(table.userId),
  activeIdx: index('trip_templates_active_idx').on(table.isActive),
}));

export type TripTemplate = typeof tripTemplates.$inferSelect;
export type NewTripTemplate = typeof tripTemplates.$inferInsert;

// Actual Commute Trips
export const commuteTrips = pgTable('commute_trips', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  templateId: integer('template_id').references(() => tripTemplates.id),
  
  // Trip date and time
  tripDate: timestamp('trip_date', { withTimezone: true }).notNull(),
  departureTime: timestamp('departure_time', { withTimezone: true }),
  arrivalTime: timestamp('arrival_time', { withTimezone: true }),
  
  // Route (can override template)
  fromAddress: text('from_address').notNull(),
  fromLatitude: decimal('from_latitude', { precision: 10, scale: 8 }),
  fromLongitude: decimal('from_longitude', { precision: 11, scale: 8 }),
  toAddress: text('to_address').notNull(),
  toLatitude: decimal('to_latitude', { precision: 10, scale: 8 }),
  toLongitude: decimal('to_longitude', { precision: 11, scale: 8 }),
  
  // Trip details
  commuteMethod: text('commute_method').notNull(),
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  actualDurationMinutes: integer('actual_duration_minutes'),
  
  // Allowances and costs
  kmAllowance: decimal('km_allowance', { precision: 4, scale: 2 }).default('0.23'),
  publicTransportCost: decimal('public_transport_cost', { precision: 6, scale: 2 }),
  homeOfficeAllowance: decimal('home_office_allowance', { precision: 4, scale: 2 }),
  totalAllowance: decimal('total_allowance', { precision: 6, scale: 2 }).notNull(),
  
  // Trip status
  status: text('status').default('completed'), // 'planned', 'in_progress', 'completed', 'cancelled'
  isFromHome: boolean('is_from_home').default(true), // true = home->office, false = office->home
  
  // Calendar integration
  calendarEventId: integer('calendar_event_id').references(() => events.id),
  
  // Notes
  notes: text('notes'),
  
  ...timestamps,
}, (table) => ({
  userIdx: index('commute_trips_user_idx').on(table.userId),
  dateIdx: index('commute_trips_date_idx').on(table.tripDate),
  templateIdx: index('commute_trips_template_idx').on(table.templateId),
  statusIdx: index('commute_trips_status_idx').on(table.status),
}));

export type CommuteTrip = typeof commuteTrips.$inferSelect;
export type NewCommuteTrip = typeof commuteTrips.$inferInsert;