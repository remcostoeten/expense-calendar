"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from '@stackframe/stack'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail, Chrome, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
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

  const handleGoogleSignUp = () => {
    window.location.href = "/handler/sign-in"
  }

  const handleEmailSignUp = () => {
    window.location.href = "/handler/sign-in"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-base">
              Sign up to start tracking your commute and allowances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignUp}
              variant="outline"
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Chrome className="mr-3 h-5 w-5" />
              Sign up with Google
            </Button>
            
            <Button
              onClick={handleEmailSignUp}
              variant="outline"
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Mail className="mr-3 h-5 w-5" />
              Sign up with Email
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
              onClick={handleEmailSignUp}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <Github className="mr-3 h-5 w-5" />
              Sign up with GitHub
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                By signing up, you agree to our{" "}
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
            Already have an account?{" "}
            <Link 
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in here
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