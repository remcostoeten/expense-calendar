import { eq } from 'drizzle-orm'

import { stackServerApp } from '@/app/stack'
import { db } from '@/server/db'
import { userProfiles, users } from '@/server/schema'
import { createFailure, createSuccess, type TResult } from '@/shared/types'

type TAuthenticatedContext = {
    db: typeof db
    stackUserId: string
    internalUserId: number
    user: unknown
}

export async function getAuthenticatedContext(): Promise<TResult<TAuthenticatedContext>> {
    try {
        const user = await stackServerApp.getUser()

        if (!user || !user.id) {
            return createFailure('User not authenticated')
        }

        // Find or create internal user ID
        const internalUserResult = await findOrCreateInternalUser(user.id, user)
        if (internalUserResult.ok === false) {
            return internalUserResult
        }

        return createSuccess({
            db,
            stackUserId: user.id,
            internalUserId: internalUserResult.value,
            user
        })
    } catch {
        return createFailure('Authentication failed')
    }
}

/**
 * Find existing internal user or create a new one for the Stack Auth user
 */
export async function findOrCreateInternalUser(
    stackUserId: string,
    stackUser: unknown
): Promise<TResult<number, string>> {
    try {
        // First, check if we have a user profile that maps to an internal user
        const profile = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, stackUserId))
            .limit(1)
            .then(rows => rows[0])

        if (profile) {
            // Profile exists, now find the corresponding internal user
            // For now, we'll need to create the mapping. Let's create an internal user
            // and store the mapping in user_profiles
            const email = (stackUser as Record<string, unknown>)?.primaryEmail as string || (stackUser as Record<string, unknown>)?.email as string
            const displayName = (stackUser as Record<string, unknown>)?.displayName as string

            // Check if internal user already exists by email
            if (email) {
                const existingUser = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1)
                    .then(rows => rows[0])

                if (existingUser) {
                    return createSuccess(existingUser.id)
                }
            }

            // Create new internal user
            const newUser = await db
                .insert(users)
                .values({
                    name: displayName || null,
                    email: email || null,
                    vehicle: null,
                    homeAddress: null,
                    homeLatitude: null,
                    homeLongitude: null
                })
                .returning({ id: users.id })
                .then(rows => rows[0])

            return createSuccess(newUser.id)
        } else {
            // No profile exists, create both profile and internal user
            const email = (stackUser as Record<string, unknown>)?.primaryEmail as string || (stackUser as Record<string, unknown>)?.email as string
            const displayName = (stackUser as Record<string, unknown>)?.displayName as string

            // Create internal user first
            const newUser = await db
                .insert(users)
                .values({
                    name: displayName || null,
                    email: email || null,
                    vehicle: null,
                    homeAddress: null,
                    homeLatitude: null,
                    homeLongitude: null
                })
                .returning({ id: users.id })
                .then(rows => rows[0])

            // Create profile that maps Stack user to internal user
            await db.insert(userProfiles).values({
                userId: stackUserId,
                displayName: displayName
            })

            return createSuccess(newUser.id)
        }
    } catch (error) {
        return createFailure(`Failed to find or create user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}
