"use client"

import { useUser } from '@stackframe/stack'
import { useCallback } from 'react'

export function useStackAuthHelper() {
  const user = useUser()

  const getInternalUserId = useCallback(async () => {
    if (!user) return null

    try {
      // Make a request to get the internal user ID
      const response = await fetch('/api/auth/internal-user-id', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to get internal user ID')
      }

      const data = await response.json()
      return data.internalUserId
    } catch (error) {
      console.error('Error getting internal user ID:', error)
      return null
    }
  }, [user])

  return {
    user,
    getInternalUserId,
    isAuthenticated: !!user,
  }
}