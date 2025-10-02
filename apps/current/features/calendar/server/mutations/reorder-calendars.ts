import { db } from "@/server/db"
import { calendars } from "@/server/schema"
import { eq } from "drizzle-orm"

type TCalendarOrder = {
  id: number
  sortOrder: number
}

export async function reorderCalendars(calendarOrders: TCalendarOrder[]) {
  for (const { id, sortOrder } of calendarOrders) {
    await db
      .update(calendars)
      .set({
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(calendars.id, id))
  }

  return calendarOrders
}
