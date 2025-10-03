"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useUser, useSignIn } from '@stackframe/stack'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInForm() {
  const user = useUser()
  const signIn = useSignIn()
  const router = useRouter()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSignIn = async () => {
    try {
      await signIn.redirectToSignIn()
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Use Stack Auth to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to sign in using Stack Auth with OAuth2 and email authentication.
          </p>
          <Button onClick={handleSignIn} className="w-full">
            Sign In with Stack Auth
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
