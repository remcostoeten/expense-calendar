import {
  pgTable,
  serial,
  text,
  boolean,
  varchar,
  timestamp,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { timestamps } from "@/server/schema-helpers";

export const commuteProfiles = pgTable('commute_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  commuteMethod: text('commute_method').notNull(), // 'car', 'public_transport', 'walking', 'bike'
  kmAllowance: decimal('km_allowance', { precision: 4, scale: 2 }).default('0.23'), // € per km
  publicTransportCost: decimal('public_transport_cost', { precision: 6, scale: 2 }), // Monthly subscription cost
  homeOfficeAllowance: decimal('home_office_allowance', { precision: 4, scale: 2 }).default('2.00'), // € per day
  homeAddress: text('home_address').notNull(), // Full address string
  homePostalCode: varchar('home_postal_code', { length: 10 }).notNull(),
  homeCity: text('home_city').notNull(),
  homeStreet: text('home_street').notNull(),
  officeAddress: text('office_address').notNull(),
  officePostalCode: varchar('office_postal_code', { length: 10 }).notNull(),
  officeCity: text('office_city').notNull(),
  officeStreet: text('office_street').notNull(),
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  hasFixedOfficeDays: boolean('has_fixed_office_days').default(false),
  fixedOfficeDays: jsonb('fixed_office_days').$type<number[]>(), // Array of day numbers (0=Sunday, 1=Monday, etc.)
  hasHomeOfficeAllowance: boolean('has_home_office_allowance').default(false),
  homeOfficeDays: jsonb('home_office_days').$type<number[]>(), // Array of day numbers
  onboardingCompleted: boolean('onboarding_completed').default(false),
  ...timestamps,
});

export type TCommuteProfile = typeof commuteProfiles.$inferSelect;

export const commuteDeclarations = pgTable('commute_declarations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  workLocation: text('work_location').notNull(), // 'office', 'home'
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  commuteMethod: text('commute_method').notNull(),
  kmAllowanceAmount: decimal('km_allowance_amount', { precision: 6, scale: 2 }),
  homeOfficeAllowanceAmount: decimal('home_office_allowance_amount', { precision: 6, scale: 2 }),
  totalAllowance: decimal('total_allowance', { precision: 6, scale: 2 }).notNull(),
  notes: text('notes'),
  ...timestamps,
});

export type TCommuteDeclaration = typeof commuteDeclarations.$inferSelect;
