import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        STACK_SECRET_SERVER_KEY: z.string().min(1),
        GOOGLE_CLIENT_ID: z.string().min(1),
        GOOGLE_CLIENT_SECRET: z.string().min(1),
        OUTLOOK_CLIENT_ID: z.string().min(1),
        OUTLOOK_CLIENT_SECRET: z.string().min(1)
    },
    client: {
        NEXT_PUBLIC_STACK_PROJECT_ID: z.string().min(1),
        NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().min(1)
    },
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        OUTLOOK_CLIENT_ID: process.env.OUTLOOK_CLIENT_ID,
        OUTLOOK_CLIENT_SECRET: process.env.OUTLOOK_CLIENT_SECRET,
        NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
            process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
    }
})
