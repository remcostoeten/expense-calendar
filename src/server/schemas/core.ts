import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  varchar,
  timestamp,
  bigint,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "../schema-helpers";

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

export type TUser = typeof users.$inferSelect;

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

export type TUserProfile = typeof userProfiles.$inferSelect;

export const userSettings = pgTable("user_settings", {
  userId: integer("user_id").notNull(), // Will be properly referenced in main schema
  showCurrentTime: boolean("show_current_time").default(true),
  showRecurringEvents: boolean("show_recurring_events").default(true),
  defaultView: varchar("default_view", { length: 20 }).default("week"),
  ...timestamps,
});

export type TUserSettings = typeof userSettings.$inferSelect;