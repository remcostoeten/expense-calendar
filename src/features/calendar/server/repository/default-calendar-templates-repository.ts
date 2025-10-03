"use server"

import { getDefaultCalendarTemplates as _getDefaultCalendarTemplates } from "../queries/get-default-calendar-templates"

export async function getDefaultCalendarTemplates() {
  return await _getDefaultCalendarTemplates()
}
