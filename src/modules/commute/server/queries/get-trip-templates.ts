"use server"

import { db } from "@/server/db"
import { tripTemplates } from "@/server/schema"
import { eq, and, desc } from "drizzle-orm"

export async function getTripTemplates(userId: string, activeOnly: boolean = true) {
  const conditions = activeOnly 
    ? and(eq(tripTemplates.userId, userId), eq(tripTemplates.isActive, true))
    : eq(tripTemplates.userId, userId)
    
  return await db
    .select()
    .from(tripTemplates)
    .where(conditions)
    .orderBy(desc(tripTemplates.createdAt))
}

export async function getTripTemplate(templateId: number, userId: string) {
  const [template] = await db
    .select()
    .from(tripTemplates)
    .where(and(eq(tripTemplates.id, templateId), eq(tripTemplates.userId, userId)))
    .limit(1)
    
  return template || null
}

export async function getRecurringTripTemplates(userId: string) {
  return await db
    .select()
    .from(tripTemplates)
    .where(and(
      eq(tripTemplates.userId, userId),
      eq(tripTemplates.isActive, true),
      eq(tripTemplates.isRecurring, true)
    ))
    .orderBy(desc(tripTemplates.createdAt))
}
