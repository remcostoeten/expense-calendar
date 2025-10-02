"use server"

import { db } from "@/server/db"
import { userIntegrations } from "@/server/schema"
import { eq, and } from "drizzle-orm"

export async function connectProviderAction(
  userId: number,
  provider: string,
  credentials: {
    accessToken: string
    refreshToken?: string
    expiresAt?: Date
  }
) {
  try {
    // Check if integration already exists
    const existingIntegration = await db
      .select()
      .from(userIntegrations)
      .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.provider, provider)))
      .limit(1)

    if (existingIntegration.length > 0) {
      // Update existing integration
      const [updatedIntegration] = await db
        .update(userIntegrations)
        .set({
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken || null,
          expiresAt: credentials.expiresAt || null,
          updatedAt: new Date(),
        })
        .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.provider, provider)))
        .returning()

      return { success: true, data: updatedIntegration }
    } else {
      // Create new integration
      const [newIntegration] = await db
        .insert(userIntegrations)
        .values({
          userId,
          provider,
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken || null,
          expiresAt: credentials.expiresAt || null,
        })
        .returning()

      return { success: true, data: newIntegration }
    }
  } catch (error) {
    console.error("Failed to connect provider:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect provider",
    }
  }
}