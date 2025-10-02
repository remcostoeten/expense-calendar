"use server"

import { db } from "@/server/db"
import { events } from "@/server/schema"
import { sql, eq, and, inArray } from "drizzle-orm"

export async function cleanupDuplicateEventsAction(userId: number) {
  try {
    // Find duplicate events for the user
    const duplicateGroups = await db
      .select({
        title: events.title,
        startTime: events.startTime,
        endTime: events.endTime,
        calendarId: events.calendarId,
        ids: sql<number[]>`array_agg(${events.id} ORDER BY ${events.id})`.as('ids'),
        count: sql<number>`count(*)`.as('count')
      })
      .from(events)
      .where(eq(events.userId, userId))
      .groupBy(events.title, events.startTime, events.endTime, events.calendarId)
      .having(sql`count(*) > 1`)

    let deletedCount = 0

    // For each group of duplicates, keep the first one and delete the rest
    for (const group of duplicateGroups) {
      if (group.ids.length > 1) {
        const idsToDelete = group.ids.slice(1) // Keep first, delete rest
        
        await db
          .delete(events)
          .where(inArray(events.id, idsToDelete))
        
        deletedCount += idsToDelete.length
      }
    }

    return { 
      success: true, 
      data: { 
        duplicateGroups: duplicateGroups.length,
        deletedEvents: deletedCount 
      } 
    }
  } catch (error) {
    console.error("Failed to cleanup duplicate events:", error)
    return { success: false, error: "Failed to cleanup duplicate events" }
  }
}