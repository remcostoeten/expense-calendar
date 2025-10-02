"use server"

import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { getAuthenticatedContext } from "@/server/helpers/auth"

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

    // Get authenticated user context
    const authContext = await getAuthenticatedContext()
    if (!authContext.ok) {
      return NextResponse.redirect(new URL(`/dashboard/calendar?error=${encodeURIComponent('Authentication required')}`, request.url))
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
    )

    const { tokens } = await oauth2Client.getAccessToken(code)
    oauth2Client.setCredentials(tokens)

    if (!tokens.access_token) {
      throw new Error("No access token received")
    }

    // TODO: Store the tokens in the database for the authenticated user
    // For now, just redirect with success
    return NextResponse.redirect(new URL("/dashboard/calendar?success=Google%20Calendar%20connected%20successfully", request.url))

  } catch (error) {
    console.error("Google OAuth callback error:", error)
    return NextResponse.redirect(new URL(`/dashboard/calendar?error=${encodeURIComponent(`Failed to connect Google Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`)}`, request.url))
  }
}
