"use server"

import { NextRequest, NextResponse } from "next/server"
import { connectProviderAction } from "@/features/calendar/server/actions/provider-connection-actions"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(new URL(`/dashboard/calendar?error=${encodeURIComponent(`OAuth failed: ${error}`)}`, request.url))
    }

    if (!code) {
      console.error("No authorization code received")
      return NextResponse.redirect(new URL("/dashboard/calendar?error=No%20authorization%20code%20received", request.url))
    }

    // Extract user ID from state parameter
    let userId = 123 // Default to mock user ID
    if (state) {
      const userIdMatch = state.match(/userId:(\d+)/)
      if (userIdMatch) {
        userId = parseInt(userIdMatch[1], 10)
      }
    }

    // Exchange code for tokens using Microsoft Graph
    const tokenResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.OUTLOOK_CLIENT_ID || "",
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || "",
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/outlook/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`)
    }

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error("No access token received")
    }

    // Store the tokens
    await connectProviderAction(userId, "outlook", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      expiresAt: tokens.expires_in ? new Date(Date.now() + (tokens.expires_in * 1000)) : undefined,
    })

    // Redirect back to calendar with success message
    return NextResponse.redirect(new URL("/dashboard/calendar?success=Outlook%20Calendar%20connected%20successfully", request.url))

  } catch (error) {
    console.error("Outlook OAuth callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard/calendar?error=${encodeURIComponent(`Failed to connect Outlook Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`)}`, request.url))
  }
}
