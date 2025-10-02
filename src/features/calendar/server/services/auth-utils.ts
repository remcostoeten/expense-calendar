import { db } from "@/server/db"
import { userIntegrations } from "@/server/schema"
import { eq } from "drizzle-orm"
import { syncLogger } from "./sync-logger"

export interface TokenData {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
}

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

/**
 * Provider-specific OAuth configurations
 */
export const PROVIDER_CONFIGS: Record<string, OAuthConfig> = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    scopes: ['https://www.googleapis.com/auth/calendar'],
  },
  outlook: {
    clientId: process.env.OUTLOOK_CLIENT_ID || '',
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
    redirectUri: process.env.OUTLOOK_REDIRECT_URI || '',
    scopes: ['https://graph.microsoft.com/Calendars.ReadWrite'],
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID || '',
    clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    redirectUri: process.env.APPLE_REDIRECT_URI || '',
    scopes: ['calendar'], // CalDAV doesn't use OAuth scopes in the same way
  },
}

/**
 * Stores or updates integration tokens for a user
 */
export async function storeIntegrationTokens(
  userId: number,
  provider: string,
  tokens: TokenData
): Promise<void> {
  try {
    await db
      .insert(userIntegrations)
      .values({
        userId,
        provider,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userIntegrations.userId, userIntegrations.provider],
        set: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          updatedAt: new Date(),
        },
      })

    syncLogger.info("storeIntegrationTokens", provider, userId, "Successfully stored integration tokens")
  } catch (error) {
    syncLogger.error(
      "storeIntegrationTokens",
      provider,
      userId,
      "Failed to store integration tokens",
      error as Error
    )
    throw error
  }
}

/**
 * Retrieves integration tokens for a user and provider
 */
export async function getIntegrationTokens(
  userId: number,
  provider: string
): Promise<TokenData | null> {
  try {
    const integration = await db.query.userIntegrations.findFirst({
      where: eq(userIntegrations.userId, userId),
    })

    if (!integration) {
      syncLogger.warn("getIntegrationTokens", provider, userId, "No integration found")
      return null
    }

    // Check if token is expired
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      syncLogger.info("getIntegrationTokens", provider, userId, "Token is expired, attempting refresh")

      const refreshedTokens = await refreshAccessToken(userId, provider)
      if (refreshedTokens) {
        return refreshedTokens
      }

      syncLogger.warn("getIntegrationTokens", provider, userId, "Failed to refresh expired token")
      return null
    }

    return {
      accessToken: integration.accessToken!,
      refreshToken: integration.refreshToken!,
      expiresAt: integration.expiresAt!,
    }
  } catch (error) {
    syncLogger.error(
      "getIntegrationTokens",
      provider,
      userId,
      "Failed to retrieve integration tokens",
      error as Error
    )
    return null
  }
}

/**
 * Refreshes an expired access token using the refresh token
 */
export async function refreshAccessToken(
  userId: number,
  provider: string
): Promise<TokenData | null> {
  try {
    const integration = await db.query.userIntegrations.findFirst({
      where: eq(userIntegrations.userId, userId),
    })

    if (!integration?.refreshToken) {
      syncLogger.error("refreshAccessToken", provider, userId, "No refresh token available")
      return null
    }

    const config = PROVIDER_CONFIGS[provider]
    if (!config) {
      syncLogger.error("refreshAccessToken", provider, userId, `No config found for provider: ${provider}`)
      return null
    }

    let newTokens: TokenData

    switch (provider) {
      case 'google':
        newTokens = await refreshGoogleToken(integration.refreshToken, config)
        break
      case 'outlook':
        newTokens = await refreshOutlookToken(integration.refreshToken, config)
        break
      case 'apple':
        // Apple Calendar uses app-specific passwords, not OAuth refresh
        syncLogger.warn("refreshAccessToken", provider, userId, "Apple Calendar doesn't support token refresh")
        return null
      default:
        syncLogger.error("refreshAccessToken", provider, userId, `Unsupported provider: ${provider}`)
        return null
    }

    // Store the refreshed tokens
    await storeIntegrationTokens(userId, provider, newTokens)

    syncLogger.info("refreshAccessToken", provider, userId, "Successfully refreshed access token")

    return newTokens
  } catch (error) {
    syncLogger.error(
      "refreshAccessToken",
      provider,
      userId,
      "Failed to refresh access token",
      error as Error
    )
    return null
  }
}

/**
 * Refreshes a Google OAuth token
 */
async function refreshGoogleToken(refreshToken: string, config: OAuthConfig): Promise<TokenData> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error(`Google token refresh failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: refreshToken, // Refresh token stays the same
    expiresAt: new Date(Date.now() + (data.expires_in * 1000)),
  }
}

/**
 * Refreshes an Outlook OAuth token
 */
async function refreshOutlookToken(refreshToken: string, config: OAuthConfig): Promise<TokenData> {
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    throw new Error(`Outlook token refresh failed: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: refreshToken, // Refresh token stays the same
    expiresAt: new Date(Date.now() + (data.expires_in * 1000)),
  }
}

/**
 * Removes integration tokens for a user and provider
 */
export async function removeIntegrationTokens(
  userId: number,
  provider: string
): Promise<void> {
  try {
    await db
      .delete(userIntegrations)
      .where(eq(userIntegrations.userId, userId))

    syncLogger.info("removeIntegrationTokens", provider, userId, "Successfully removed integration tokens")
  } catch (error) {
    syncLogger.error(
      "removeIntegrationTokens",
      provider,
      userId,
      "Failed to remove integration tokens",
      error as Error
    )
    throw error
  }
}

