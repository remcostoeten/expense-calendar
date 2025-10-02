"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Zap, Shield } from "lucide-react"

export default function LandingPage() {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard/calendar")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect via useEffect
  }

  const handleGetStarted = () => {
    router.push("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Commute Tracker</span>
          </div>
          <Button onClick={handleGetStarted} variant="outline">
            Sign In
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Track Your Commute,
            <br />
            Claim Your Allowance
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automatically track your work commute, calculate allowances, and manage your declarations with ease. Built for Dutch employees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-6">
              Get Started Free
            </Button>
            <Button onClick={handleGetStarted} variant="outline" size="lg" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle>Automatic Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically track your daily commute and calculate allowances based on 
                distance, method, and Dutch tax regulations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <CardTitle>Smart Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Calculate commute allowances (€0.23/km), home office allowances (€2/day), 
                and generate reports for your employer or tax declarations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Calendar Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sync with Google Calendar and Outlook to automatically detect office days 
                and home office days from your existing schedule.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl">Ready to track your commute?</CardTitle>
            <CardDescription className="text-lg">
              Join Dutch employees who use our app to automatically track their commute allowances and save time on declarations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGetStarted} size="lg" className="text-lg px-8 py-6">
              Start Tracking Your Commute
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Commute Tracker. Built with Next.js 15 and Stack Auth.</p>
        </div>
      </footer>
    </div>
  )
}