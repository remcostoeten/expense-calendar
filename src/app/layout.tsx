import { StackProvider } from '@stackframe/stack'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { stackServerApp } from './stack'
import { Suspense } from 'react'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
    title: 'Calendar || Commute tracker',
    description: 'Get a grip on your work commute'
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <StackProvider app={stackServerApp}>
            <html lang='en' suppressHydrationWarning>
                <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
                    <Providers>
                        <Suspense fallback={<div className="p-4"><div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" /><div className="h-10 w-full bg-muted rounded animate-pulse" /></div>}>
                            {children}
                        </Suspense>
                    </Providers>
                </body>
            </html>
        </StackProvider>
    )
}
