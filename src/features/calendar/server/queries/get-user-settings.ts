import { db } from "@/server/db"
import { userSettings } from "@/server/schema"
import { eq } from "drizzle-orm"

export async function getUserSettings(userId: number) {
  const result = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  return result[0] || null
}
