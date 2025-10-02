"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/server/db"
import { userIntegrations } from "@/server/schema"
import { eq } from "drizzle-orm"
import {
  storeIntegrationTokens,
  getIntegrationTokens,
  removeIntegrationTokens,
  PROVIDER_CONFIGS,
  type TokenData
} from "../services/auth-utils"
import { syncLogger } from "../services/sync-logger"

/**
 * Connects a user to an external calendar provider
 */
export async function connectProviderAction(
  userId: number,
  provider: string,
  tokens: TokenData
) {
  try {
    syncLogger.info("connectProvider", provider, userId, "Starting provider connection")

    // Validate provider
    if (!PROVIDER_CONFIGS[provider]) {
      throw new Error(`Unsupported provider: ${provider}`)
    }

    // Store the integration tokens
    await storeIntegrationTokens(userId, provider, tokens)

    // Revalidate calendar data
    revalidatePath("/dashboard/calendar")

    syncLogger.info("connectProvider", provider, userId, "Successfully connected to provider")

    return { success: true, provider }
  } catch (error) {
    syncLogger.error(
      "connectProvider",
      provider,
      userId,
      "Failed to connect to provider",
      error as Error
    )

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect provider",
    }
  }
}

/**
 * Disconnects a user from an external calendar provider
 */
export async function disconnectProviderAction(userId: number, provider: string) {
  try {
    syncLogger.info("disconnectProvider", provider, userId, "Starting provider disconnection")

    // Remove the integration tokens
    await removeIntegrationTokens(userId, provider)

    // TODO: Clean up any calendar and event integrations for this provider
    // This would involve removing calendarIntegrations and eventIntegrations records

    // Revalidate calendar data
    revalidatePath("/dashboard/calendar")

    syncLogger.info("disconnectProvider", provider, userId, "Successfully disconnected from provider")

    return { success: true, provider }
  } catch (error) {
    syncLogger.error(
      "disconnectProvider",
      provider,
      userId,
      "Failed to disconnect from provider",
      error as Error
    )

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to disconnect provider",
    }
  }
}

/**
 * Gets all connected providers for a user
 */
export async function getConnectedProvidersAction(userId: number) {
  try {
    const integrations = await db.query.userIntegrations.findMany({
      where: (u, { eq }) => eq(u.userId, userId),
    })

    const connectedProviders = integrations.map(integration => ({
      provider: integration.provider,
      connectedAt: integration.createdAt,
      expiresAt: integration.expiresAt,
    }))

    return { success: true, providers: connectedProviders }
  } catch (error) {
    syncLogger.error(
      "getConnectedProviders",
      "system",
      userId,
      "Failed to get connected providers",
      error as Error
    )

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get providers",
      providers: [],
    }
  }
}

/**
 * Checks if a user is connected to a specific provider
 */
export async function isProviderConnectedAction(userId: number, provider: string) {
  try {
    const tokens = await getIntegrationTokens(userId, provider)

    return {
      success: true,
      connected: tokens !== null,
      expiresAt: tokens?.expiresAt,
    }
  } catch (error) {
    syncLogger.error(
      "isProviderConnected",
      provider,
      userId,
      "Failed to check provider connection",
      error as Error
    )

    return {
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : "Failed to check connection",
    }
  }
}

/**
 * Gets OAuth authorization URL for a provider
 */
export async function getOAuthUrl(provider: string, state?: string, userId?: number) {
  const config = PROVIDER_CONFIGS[provider]

  if (!config) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  // Use the callback URLs for the OAuth flow
  const redirectUri = getRedirectUri(provider)

  // Include user ID in state for callback handling
  const stateWithUser = userId ? `${state || ''}|userId:${userId}` : state || ''

  switch (provider) {
    case 'google':
      const googleParams = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUri,
        scope: config.scopes.join(' '),
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        state: stateWithUser,
      })
      return `https://accounts.google.com/o/oauth2/v2/auth?${googleParams.toString()}`

    case 'outlook':
      const outlookParams = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUri,
        scope: config.scopes.join(' '),
        response_type: 'code',
        state: stateWithUser,
      })
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${outlookParams.toString()}`

    case 'apple':
      // Apple Calendar typically uses app-specific passwords rather than OAuth
      // This would need to be implemented differently
      throw new Error('Apple Calendar connection not yet implemented')

    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * Gets the redirect URI for a provider (for use in OAuth flows)
 */
export async function getRedirectUri(provider: string): string {
  switch (provider) {
    case 'google':
      return process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
    case 'outlook':
      return process.env.OUTLOOK_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/outlook/callback`
    case 'apple':
      return process.env.APPLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/apple/callback`
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
