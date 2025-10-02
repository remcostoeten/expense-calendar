import { timestamp } from 'drizzle-orm/pg-core';

export type TTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

// Base type for entities, ensuring consistent ID and timestamp fields
export type TBaseEntity = {
  id: number;
} & TTimestamps;

// Helper for creating timestamp columns
export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};
