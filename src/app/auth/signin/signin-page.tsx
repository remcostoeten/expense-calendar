"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail, Chrome, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
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

  const handleGoogleSignIn = () => {
    window.location.href = "/handler/sign-in"
  }

  const handleEmailSignIn = () => {
    window.location.href = "/handler/sign-in"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <svg
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Commute Tracker</CardTitle>
            <CardDescription className="text-base">
              Sign in to track your commute and manage your allowances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Chrome className="mr-3 h-5 w-5" />
              Continue with Google
            </Button>
            
            <Button
              onClick={handleEmailSignIn}
              variant="outline"
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Mail className="mr-3 h-5 w-5" />
              Continue with Email
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              onClick={handleEmailSignIn}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Github className="mr-3 h-5 w-5" />
              Continue with GitHub
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link 
              href="/auth/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link 
            href="/landing"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}