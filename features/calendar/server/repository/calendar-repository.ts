import { TResult, validateUserId } from "@/lib/validation"
import { db } from "@/server/db"
import { calendars } from "@/server/schema"
import { TBaseEntity } from "@/server/schema-helpers"
import { eq } from "drizzle-orm"

export type TCalendar = TBaseEntity & {
  name: string
  description?: string | null
  color: string
  userId: number
  isDefault: boolean
}

export type TCreateCalendarInput = {
  userId: number
  name: string
  description?: string | null
  color?: string
  isDefault?: boolean
}

// Factory function to create a calendar repository
export function createCalendarRepository(dbInstance = db) {
  async function create(data: TCreateCalendarInput): Promise<TResult<TCalendar, string>> {
    const userIdValidation = validateUserId(data.userId)
    if (!userIdValidation.ok) {
      return userIdValidation
    }

    try {
      const [calendar] = await dbInstance
        .insert(calendars)
        .values({
          name: data.name,
          description: data.description ?? null,
          color: data.color ?? "#3b82f6",
          userId: data.userId,
          isDefault: data.isDefault ?? false,
        })
        .returning()

      return { ok: true, value: calendar as TCalendar }
    } catch (error) {
      console.error("Failed to create calendar:", error)
      return { ok: false, error: "Failed to create calendar" }
    }
  }

  async function findByUserId(userId: number): Promise<TResult<TCalendar[], string>> {
    const validation = validateUserId(userId)
    if (!validation.ok) {
      return validation
    }

    try {
      const userCalendars = await dbInstance
        .select()
        .from(calendars)
        .where(eq(calendars.userId, userId))
        .orderBy(calendars.createdAt)

      return { ok: true, value: userCalendars as TCalendar[] }
    } catch (error) {
      console.error("Failed to fetch calendars:", error)
      return { ok: false, error: "Failed to fetch calendars" }
    }
  }

  return {
    create,
    findByUserId,
  }
}

// Export a default instance using the default db connection
export const calendarRepository = createCalendarRepository()