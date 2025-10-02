import { StackProvider } from '@stackframe/stack'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { stackServerApp } from './stack'
import './globals.css'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
})

export const metadata: Metadata = {
    title: 'Expense Calendar - Track Your Commute Expenses',
    description: 'Track and calculate your commute expenses with ease'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <StackProvider app={stackServerApp}>
            <html lang='en'>
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-[-1] size-full bg-[radial-gradient(circle,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:12px_12px]"
                    />
                    <div className='bg-neutral-100'>
                        <div className='min-h-screen flex flex-col'>
                            <main className='flex-1'>{children}</main>
                        </div>
                    </div>
                    <Toaster />
                </body>
            </html>
        </StackProvider>
    )
}
