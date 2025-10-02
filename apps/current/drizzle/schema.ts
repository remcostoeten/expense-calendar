import { pgTable, index, foreignKey, serial, varchar, text, char, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const calendars = pgTable("calendars", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	color: char({ length: 7 }).default('#3b82f6').notNull(),
	userId: integer("user_id").notNull(),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	sortOrder: integer("sort_order").default(0),
}, (table) => [
	index("calendars_sort_idx").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
	index("calendars_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "calendars_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const events = pgTable("events", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	allDay: boolean("all_day").default(false),
	location: varchar({ length: 255 }),
	calendarId: integer("calendar_id").notNull(),
	userId: integer("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	recurrenceRule: text("recurrence_rule"),
}, (table) => [
	index("events_calendar_idx").using("btree", table.calendarId.asc().nullsLast().op("int4_ops")),
	index("events_time_idx").using("btree", table.startTime.asc().nullsLast().op("timestamp_ops"), table.endTime.asc().nullsLast().op("timestamp_ops")),
	index("events_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.calendarId],
			foreignColumns: [calendars.id],
			name: "events_calendar_id_calendars_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "events_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const eventReminders = pgTable("event_reminders", {
	id: serial().primaryKey().notNull(),
	eventId: integer("event_id").notNull(),
	minutesBefore: integer("minutes_before").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("event_reminders_event_idx").using("btree", table.eventId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_reminders_event_id_events_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("users_email_unique").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const userIntegrations = pgTable("user_integrations", {
	userId: serial("user_id").notNull(),
	provider: text().notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	appPassword: text("app_password"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_integrations_user_provider_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.provider.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_integrations_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const calendarIntegrations = pgTable("calendar_integrations", {
	calendarId: serial("calendar_id").notNull(),
	provider: text().notNull(),
	externalId: text("external_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("calendar_integrations_calendar_provider_idx").using("btree", table.calendarId.asc().nullsLast().op("int4_ops"), table.provider.asc().nullsLast().op("int4_ops")),
	index("calendar_integrations_provider_external_idx").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.externalId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.calendarId],
			foreignColumns: [calendars.id],
			name: "calendar_integrations_calendar_id_calendars_id_fk"
		}).onDelete("cascade"),
]);

export const eventIntegrations = pgTable("event_integrations", {
	eventId: serial("event_id").notNull(),
	provider: text().notNull(),
	externalId: text("external_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("event_integrations_event_provider_idx").using("btree", table.eventId.asc().nullsLast().op("int4_ops"), table.provider.asc().nullsLast().op("int4_ops")),
	index("event_integrations_provider_external_idx").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.externalId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.eventId],
			foreignColumns: [events.id],
			name: "event_integrations_event_id_events_id_fk"
		}).onDelete("cascade"),
]);

export const defaultCalendarTemplates = pgTable("default_calendar_templates", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	color: char({ length: 7 }).default('#3b82f6').notNull(),
	isDefault: boolean("is_default").default(false),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("default_calendar_templates_sort_idx").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
]);

export const userSettings = pgTable("user_settings", {
	userId: integer("user_id"),
	showCurrentTime: boolean("show_current_time").default(true),
	showRecurringEvents: boolean("show_recurring_events").default(true),
	defaultView: varchar("default_view", { length: 20 }).default('week'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
