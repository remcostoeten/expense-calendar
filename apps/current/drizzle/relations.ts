import { relations } from "drizzle-orm/relations";
import { users, calendars, events, eventReminders, userIntegrations, calendarIntegrations, eventIntegrations, userSettings } from "./schema";

export const calendarsRelations = relations(calendars, ({one, many}) => ({
	user: one(users, {
		fields: [calendars.userId],
		references: [users.id]
	}),
	events: many(events),
	calendarIntegrations: many(calendarIntegrations),
}));

export const usersRelations = relations(users, ({many}) => ({
	calendars: many(calendars),
	events: many(events),
	userIntegrations: many(userIntegrations),
	userSettings: many(userSettings),
}));

export const eventsRelations = relations(events, ({one, many}) => ({
	calendar: one(calendars, {
		fields: [events.calendarId],
		references: [calendars.id]
	}),
	user: one(users, {
		fields: [events.userId],
		references: [users.id]
	}),
	eventReminders: many(eventReminders),
	eventIntegrations: many(eventIntegrations),
}));

export const eventRemindersRelations = relations(eventReminders, ({one}) => ({
	event: one(events, {
		fields: [eventReminders.eventId],
		references: [events.id]
	}),
}));

export const userIntegrationsRelations = relations(userIntegrations, ({one}) => ({
	user: one(users, {
		fields: [userIntegrations.userId],
		references: [users.id]
	}),
}));

export const calendarIntegrationsRelations = relations(calendarIntegrations, ({one}) => ({
	calendar: one(calendars, {
		fields: [calendarIntegrations.calendarId],
		references: [calendars.id]
	}),
}));

export const eventIntegrationsRelations = relations(eventIntegrations, ({one}) => ({
	event: one(events, {
		fields: [eventIntegrations.eventId],
		references: [events.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));