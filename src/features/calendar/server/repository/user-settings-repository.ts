import { db } from "@/server/db"
import { userSettings } from "@/server/schema"
import { eq } from "drizzle-orm"

export interface UserSettingsData {
  showCurrentTime?: boolean
  showRecurringEvents?: boolean
  defaultView?: string
}

export class UserSettingsRepository {
  async getUserSettings(userId: number) {
    const result = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)

    return result[0] || null
  }

  async createUserSettings(userId: number, settings: UserSettingsData = {}) {
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

  async updateUserSettings(userId: number, settings: UserSettingsData) {
    const result = await db
      .update(userSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning()

    return result[0]
  }

  async upsertUserSettings(userId: number, settings: UserSettingsData) {
    const existing = await this.getUserSettings(userId)
    
    if (existing) {
      return this.updateUserSettings(userId, settings)
    } else {
      return this.createUserSettings(userId, settings)
    }
  }
}