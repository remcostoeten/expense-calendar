import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "@/server/schema-helpers";

export const tripTemplates = pgTable('trip_templates', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  fromAddress: text('from_address').notNull(),
  fromLatitude: decimal('from_latitude', { precision: 10, scale: 8 }),
  fromLongitude: decimal('from_longitude', { precision: 11, scale: 8 }),
  toAddress: text('to_address').notNull(),
  toLatitude: decimal('to_latitude', { precision: 10, scale: 8 }),
  toLongitude: decimal('to_longitude', { precision: 11, scale: 8 }),
  commuteMethod: text('commute_method').notNull(), // 'car', 'public_transport', 'walking', 'bike'
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  estimatedDurationMinutes: integer('estimated_duration_minutes'),
  kmAllowance: decimal('km_allowance', { precision: 4, scale: 2 }).default('0.23'),
  publicTransportCost: decimal('public_transport_cost', { precision: 6, scale: 2 }),
  homeOfficeAllowance: decimal('home_office_allowance', { precision: 4, scale: 2 }),
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: text('recurrence_pattern'), // 'daily', 'weekly', 'weekdays', 'custom'
  recurrenceDays: jsonb('recurrence_days').$type<number[]>(), // Array of day numbers (0=Sunday)
  recurrenceStartDate: timestamp('recurrence_start_date', { withTimezone: true }),
  recurrenceEndDate: timestamp('recurrence_end_date', { withTimezone: true }),
  addToCalendar: boolean('add_to_calendar').default(false),
  calendarId: integer('calendar_id'), // Will be properly referenced in main schema
  eventTitle: text('event_title'),
  eventDescription: text('event_description'),
  isActive: boolean('is_active').default(true),
  
  ...timestamps,
}, (table) => ({
  userIdx: index('trip_templates_user_idx').on(table.userId),
  activeIdx: index('trip_templates_active_idx').on(table.isActive),
}));

export type TTripTemplate = typeof tripTemplates.$inferSelect;

export const commuteTrips = pgTable('commute_trips', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  templateId: integer('template_id').references(() => tripTemplates.id),
  tripDate: timestamp('trip_date', { withTimezone: true }).notNull(),
  departureTime: timestamp('departure_time', { withTimezone: true }),
  arrivalTime: timestamp('arrival_time', { withTimezone: true }),
  fromAddress: text('from_address').notNull(),
  fromLatitude: decimal('from_latitude', { precision: 10, scale: 8 }),
  fromLongitude: decimal('from_longitude', { precision: 11, scale: 8 }),
  toAddress: text('to_address').notNull(),
  toLatitude: decimal('to_latitude', { precision: 10, scale: 8 }),
  toLongitude: decimal('to_longitude', { precision: 11, scale: 8 }),
  commuteMethod: text('commute_method').notNull(),
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  actualDurationMinutes: integer('actual_duration_minutes'),
  kmAllowance: decimal('km_allowance', { precision: 4, scale: 2 }).default('0.23'),
  publicTransportCost: decimal('public_transport_cost', { precision: 6, scale: 2 }),
  homeOfficeAllowance: decimal('home_office_allowance', { precision: 4, scale: 2 }),
  totalAllowance: decimal('total_allowance', { precision: 6, scale: 2 }).notNull(),
  status: text('status').default('completed'), // 'planned', 'in_progress', 'completed', 'cancelled'
  isFromHome: boolean('is_from_home').default(true), // true = home->office, false = office->home
  calendarEventId: integer('calendar_event_id'), // Will be properly referenced in main schema
  notes: text('notes'),
  
  ...timestamps,
}, (table) => ({
  userIdx: index('commute_trips_user_idx').on(table.userId),
  dateIdx: index('commute_trips_date_idx').on(table.tripDate),
  templateIdx: index('commute_trips_template_idx').on(table.templateId),
  statusIdx: index('commute_trips_status_idx').on(table.status),
}));

export type TCommuteTrip = typeof commuteTrips.$inferSelect;
