"use server"

import { db } from "@/server/db"
import { commuteProfiles } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function getCommuteProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(commuteProfiles)
    .where(eq(commuteProfiles.userId, userId))
    .limit(1)

  return profile || null
}
