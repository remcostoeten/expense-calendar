"use server"

import { calendarRepository } from "../repository/calendar-repository"

export async function getCalendarsAction(userId: number) {
  const result = await calendarRepository.findByUserId(userId)

  if (!result.ok) {
    console.error("Failed to fetch calendars:", result.error)
    return { success: false, error: result.error }
  }

  return { success: true, data: result.value }
}
