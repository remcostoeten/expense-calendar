import { StackProvider } from '@stackframe/stack'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { stackServerApp } from './stack'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
    title: 'Calendar || Commute tracker',
    description: 'Calendar and commute tracker application'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <StackProvider app={stackServerApp}>
            <html lang='en' suppressHydrationWarning>
                <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <Suspense fallback={<div>Loading...</div>}>
                            {children}
                        </Suspense>
                    </ThemeProvider>
                    <Toaster />
                </body>
            </html>
        </StackProvider>
    )
}
