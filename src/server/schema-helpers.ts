import { timestamp } from "drizzle-orm/pg-core"

export type TTimestamps = {
  createdAt: Date
  updatedAt: Date
}

export const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}

export type TBaseEntity = {
  id: number
} & TTimestamps