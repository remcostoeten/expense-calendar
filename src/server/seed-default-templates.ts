import { db } from "@/server/db"
import { defaultCalendarTemplates } from "@/server/schema"

export async function seedDefaultCalendarTemplates() {
  try {
    // Check if templates already exist
    const existingTemplates = await db
      .select()
      .from(defaultCalendarTemplates)
      .limit(1)

    if (existingTemplates.length > 0) {
      console.log("Default calendar templates already exist")
      return
    }

    // Insert default templates
    await db.insert(defaultCalendarTemplates).values([
      {
        name: "Personal",
        description: "Personal events and appointments",
        color: "#3b82f6",
        isDefault: true,
        sortOrder: 0,
      },
      {
        name: "Work",
        description: "Work-related events and meetings", 
        color: "#10b981",
        isDefault: false,
        sortOrder: 1,
      },
      {
        name: "Family",
        description: "Family events and activities",
        color: "#f59e0b",
        isDefault: false,
        sortOrder: 2,
      },
      {
        name: "Health",
        description: "Health appointments and wellness",
        color: "#ef4444",
        isDefault: false,
        sortOrder: 3,
      }
    ])

    console.log("Default calendar templates seeded successfully")
  } catch (error) {
    console.error("Failed to seed default calendar templates:", error)
    throw error
  }
}
