#!/usr/bin/env tsx

/**
 * Fix events that violate the end_time_after_start_time constraint
 * Run with: npx tsx scripts/fix-constraint-violations.ts
 */

import { db } from "../server/db"
import { events } from "../server/schema"
import { sql, desc } from "drizzle-orm"

async function fixConstraintViolations() {
  console.log("🔍 Finding events that violate end_time_after_start_time constraint...")

  try {
    // Find events where end_time <= start_time
    const violations = await db
      .select()
      .from(events)
      .where(sql`${events.endTime} <= ${events.startTime}`)

    console.log(`📊 Found ${violations.length} events violating the constraint`)

    if (violations.length === 0) {
      console.log("✅ No constraint violations found!")
      return
    }

    // Show what will be fixed
    for (const event of violations.slice(0, 5)) { // Show first 5
      console.log(`📝 Event "${event.title}": ${event.startTime} -> ${event.endTime}`)
    }

    if (violations.length > 5) {
      console.log(`... and ${violations.length - 5} more`)
    }

    console.log(`\n🔧 Fixing ${violations.length} events by adding 1 hour to end_time...`)

    // Fix the violations by adding 1 hour to end_time
    const result = await db
      .update(events)
      .set({
        endTime: sql`${events.endTime} + INTERVAL '1 hour'`
      })
      .where(sql`${events.endTime} <= ${events.startTime}`)

    console.log(`✅ Successfully fixed ${violations.length} events`)

    // Verify no more violations
    const remainingViolations = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(sql`${events.endTime} <= ${events.startTime}`)

    console.log(`📈 Remaining violations: ${remainingViolations[0].count}`)

  } catch (error) {
    console.error("❌ Error fixing constraint violations:", error)
    process.exit(1)
  }
}

// Run the fix
fixConstraintViolations()
  .then(() => {
    console.log("🎉 Constraint violations fixed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Failed to fix constraint violations:", error)
    process.exit(1)
  })
