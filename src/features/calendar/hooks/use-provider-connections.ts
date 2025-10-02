"use client"

import { useState, useEffect } from "react"
import {
  connectProviderAction,
  disconnectProviderAction,
  getConnectedProvidersAction,
  isProviderConnectedAction,
  getOAuthUrl,
} from "../server/actions/provider-connection-actions"
import { useCalendarStore } from "@/stores/calendar-store"

export interface ProviderConnection {
  provider: string
  connectedAt: Date
  expiresAt?: Date
}

export interface ProviderStatus {
  connected: boolean
  expiresAt?: Date
  error?: string
}

export function useProviderConnections(userId: number) {
  const [connections, setConnections] = useState<ProviderConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { externalProviders, updateExternalProvider } = useCalendarStore()

  const fetchConnections = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await getConnectedProvidersAction(userId)

      if (result.success) {
        setConnections(result.providers)

        // Update external provider connection status in the store
        externalProviders.forEach((provider) => {
          const isConnected = result.providers.some(conn => conn.provider === provider.provider)
          updateExternalProvider(provider.id, { isConnected })
        })
      } else {
        setError(result.error || "Failed to load provider connections")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchConnections()
    }
  }, [userId])

  const connectProvider = async (provider: string, tokens: { accessToken: string; refreshToken?: string; expiresAt?: Date }) => {
    try {
      setError(null)

      const result = await connectProviderAction(userId, provider, tokens)

      if (result.success) {
        await fetchConnections() // Refresh the connections list

        // Update the external provider in the store to mark as connected
        const providerInStore = externalProviders.find(p => p.provider === provider)
        if (providerInStore) {
          updateExternalProvider(providerInStore.id, { isConnected: true })
        }

        return { success: true }
      } else {
        setError(result.error || "Failed to connect provider")
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect provider"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const disconnectProvider = async (provider: string) => {
    try {
      setError(null)

      const result = await disconnectProviderAction(userId, provider)

      if (result.success) {
        await fetchConnections() // Refresh the connections list

        // Update the external provider in the store to mark as disconnected
        const providerInStore = externalProviders.find(p => p.provider === provider)
        if (providerInStore) {
          updateExternalProvider(providerInStore.id, { isConnected: false, isVisible: false })
        }

        return { success: true }
      } else {
        setError(result.error || "Failed to disconnect provider")
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disconnect provider"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const getProviderStatus = async (provider: string): Promise<ProviderStatus> => {
    try {
      const result = await isProviderConnectedAction(userId, provider)

      if (result.success) {
        return {
          connected: result.connected,
          expiresAt: result.expiresAt,
        }
      } else {
        return {
          connected: false,
          error: result.error,
        }
      }
    } catch (err) {
      return {
        connected: false,
        error: err instanceof Error ? err.message : "Failed to check connection",
      }
    }
  }

  const getAuthorizationUrl = async (provider: string, state?: string, userId?: number): Promise<string> => {
    try {
      return await getOAuthUrl(provider, state, userId)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to get authorization URL")
    }
  }

  return {
    connections,
    isLoading,
    error,
    connectProvider,
    disconnectProvider,
    getProviderStatus,
    getAuthorizationUrl,
    refreshConnections: fetchConnections,
  }
}
