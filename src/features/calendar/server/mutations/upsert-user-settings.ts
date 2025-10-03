import { db } from "@/server/db"
import { userSettings } from "@/server/schema"
import { eq } from "drizzle-orm"

export interface UserSettingsData {
  showCurrentTime?: boolean
  showRecurringEvents?: boolean
  defaultView?: string
}

export async function upsertUserSettings(userId: number, settings: UserSettingsData) {
  const existing = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1)

  if (existing[0]) {
    const result = await db
      .update(userSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning()

    return result[0]
  } else {
    const result = await db
      .insert(userSettings)
      .values({
        userId,
        showCurrentTime: settings.showCurrentTime ?? true,
        showRecurringEvents: settings.showRecurringEvents ?? true,
        defaultView: settings.defaultView ?? "week",
      })
      .returning()

    return result[0]
  }
}
