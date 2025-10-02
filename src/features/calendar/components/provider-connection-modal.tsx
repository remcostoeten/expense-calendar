"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useProviderConnections } from "../hooks/use-provider-connections"
import { ExternalProvider } from "@/stores/calendar-store"

type TProps = {
  userId: number
  trigger?: React.ReactNode
  externalProviders: ExternalProvider[]
}

export function ProviderConnectionModal({ userId, trigger, externalProviders }: ProviderConnectionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { connectProvider, disconnectProvider, getAuthorizationUrl, error } = useProviderConnections(userId)

  async function handleConnect(provider: string) {
    try {
      const authUrl = await getAuthorizationUrl(provider, undefined, userId)
      window.location.href = authUrl
    } catch (err) {
      console.error('Failed to get authorization URL:', err)
    }
  }

  async function handleDisconnect(provider: string) {
    await disconnectProvider(provider)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🌐'
      case 'outlook':
        return '📧'
      case 'apple':
        return '🍎'
      default:
        return '📅'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Connect Calendars
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>External Calendar Connections</DialogTitle>
          <DialogDescription>
            Connect your external calendar providers to sync events across all your calendars.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {externalProviders.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getProviderIcon(provider.provider)}</span>
                <div>
                  <h3 className="font-medium">{provider.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {provider.isConnected ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {provider.isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(provider.provider)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(provider.provider)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">Note:</p>
            <p>
              Connecting external calendars will allow you to view and sync events from Google Calendar,
              Outlook, and Apple Calendar. Events from connected providers will appear in your calendar
              view and can be toggled on/off independently.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

