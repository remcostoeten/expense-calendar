#!/usr/bin/env tsx

/**
 * Cleanup duplicate events script
 * Run with: npx tsx scripts/cleanup-duplicates.ts
 */

import { db } from "../server/db"
import { events } from "../server/schema"
import { sql, eq, inArray } from "drizzle-orm"

async function cleanupDuplicates() {
  console.log("🔍 Finding duplicate events...")

  try {
    // Find duplicate events
    const duplicateGroups = await db
      .select({
        title: events.title,
        startTime: events.startTime,
        endTime: events.endTime,
        calendarId: events.calendarId,
        userId: events.userId,
        ids: sql<number[]>`array_agg(${events.id} ORDER BY ${events.id})`.as('ids'),
        count: sql<number>`count(*)`.as('count')
      })
      .from(events)
      .groupBy(events.title, events.startTime, events.endTime, events.calendarId, events.userId)
      .having(sql`count(*) > 1`)

    console.log(`📊 Found ${duplicateGroups.length} groups of duplicate events`)

    if (duplicateGroups.length === 0) {
      console.log("✅ No duplicates found!")
      return
    }

    let totalDeleted = 0

    // Show what will be deleted
    for (const group of duplicateGroups) {
      console.log(`\n📝 Event: "${group.title}"`)
      console.log(`   Start: ${group.startTime}`)
      console.log(`   User ID: ${group.userId}`)
      console.log(`   Calendar ID: ${group.calendarId}`)
      console.log(`   Duplicates: ${group.count} (keeping ID ${group.ids[0]}, deleting ${group.ids.slice(1).join(', ')})`)
    }

    console.log(`\n🗑️  Will delete ${duplicateGroups.reduce((sum, group) => sum + group.ids.length - 1, 0)} duplicate events`)
    
    // Delete duplicates (keep the first one in each group)
    for (const group of duplicateGroups) {
      if (group.ids.length > 1) {
        const idsToDelete = group.ids.slice(1) // Keep first, delete rest
        
        await db
          .delete(events)
          .where(inArray(events.id, idsToDelete))
        
        totalDeleted += idsToDelete.length
      }
    }

    console.log(`✅ Successfully deleted ${totalDeleted} duplicate events`)

    // Show final count
    const remainingEvents = await db.select({ count: sql<number>`count(*)` }).from(events)
    console.log(`📈 Total events remaining: ${remainingEvents[0].count}`)

  } catch (error) {
    console.error("❌ Error cleaning up duplicates:", error)
    process.exit(1)
  }
}

// Run the cleanup
cleanupDuplicates()
  .then(() => {
    console.log("🎉 Cleanup completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Cleanup failed:", error)
    process.exit(1)
  })