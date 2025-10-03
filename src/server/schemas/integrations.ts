import {
  pgTable,
  integer,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "../schema-helpers";

export const userIntegrations = pgTable("user_integrations", {
  userId: integer("user_id").notNull(), // Will be properly referenced in main schema
  provider: text("provider").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  appPassword: text("app_password"),
  expiresAt: timestamp("expires_at"),
  ...timestamps,
}, (table) => ({
  userProviderIdx: index("user_integrations_user_provider_idx").on(table.userId, table.provider),
}));

export type TUserIntegration = typeof userIntegrations.$inferSelect;

export const calendarIntegrations = pgTable("calendar_integrations", {
  calendarId: integer("calendar_id").notNull(), // Will be properly referenced in main schema
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  ...timestamps,
}, (table) => ({
  calendarProviderIdx: index("calendar_integrations_calendar_provider_idx").on(table.calendarId, table.provider),
  providerExternalIdx: index("calendar_integrations_provider_external_idx").on(table.provider, table.externalId),
}));

export type TCalendarIntegration = typeof calendarIntegrations.$inferSelect;

export const eventIntegrations = pgTable("event_integrations", {
  eventId: integer("event_id").notNull(), // Will be properly referenced in main schema
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  ...timestamps,
}, (table) => ({
  eventProviderIdx: index("event_integrations_event_provider_idx").on(table.eventId, table.provider),
  providerExternalIdx: index("event_integrations_provider_external_idx").on(table.provider, table.externalId),
}));

export type TEventIntegration = typeof eventIntegrations.$inferSelect;