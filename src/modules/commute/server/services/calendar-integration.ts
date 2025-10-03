"use server"

import { db } from "@/server/db"
import { events, calendars, commuteTrips } from "@/server/schema"
import { eq, and } from "drizzle-orm"
import type { CommuteTrip, TripTemplate } from "@/server/schema"

export async function createTripCalendarEvent(
    trip: CommuteTrip,
    template?: TripTemplate
) {
    try {
		const [calendar] = await db
			.select()
			.from(calendars)
			.where(and(
				eq(calendars.userId, parseInt(trip.userId)),
				eq(calendars.isDefault, true)
			))
			.limit(1)

        if (!calendar) {
            throw new Error('No default calendar found for user')
        }

        const eventTitle = template?.eventTitle || `${trip.isFromHome ? 'Home to Office' : 'Office to Home'} Commute`
        const eventDescription = template?.eventDescription ||
            `Commute via ${trip.commuteMethod}\n` +
            `Distance: ${trip.distanceKm} km\n` +
            `Allowance: €${trip.totalAllowance}\n` +
            `From: ${trip.fromAddress}\n` +
            `To: ${trip.toAddress}` +
            (trip.notes ? `\n\nNotes: ${trip.notes}` : '')

        const tripDate = new Date(trip.tripDate)
        const startTime = trip.departureTime ? new Date(trip.departureTime) : tripDate
        const endTime = trip.arrivalTime ? new Date(trip.arrivalTime) :
            new Date(startTime.getTime() + (trip.actualDurationMinutes || 30) * 60000)

        const [event] = await db
            .insert(events)
            .values({
                title: eventTitle,
                description: eventDescription,
                startTime,
                endTime,
                allDay: false,
                location: `${trip.fromAddress} → ${trip.toAddress}`,
                calendarId: calendar.id,
                userId: parseInt(trip.userId)
            })
            .returning()

        await db
            .update(commuteTrips)
            .set({ calendarEventId: event.id })
            .where(eq(commuteTrips.id, trip.id))
        return event
    } catch (error) {
        console.error('Failed to create trip calendar event:', error)
        throw error
    }
}

export async function updateTripCalendarEvent(
    trip: CommuteTrip,
    template?: TripTemplate
) {
    try {
        if (!trip.calendarEventId) {
            return createTripCalendarEvent(trip, template)
        }

        const eventTitle = template?.eventTitle || `${trip.isFromHome ? 'Home to Office' : 'Office to Home'} Commute`
        const eventDescription = template?.eventDescription ||
            `Commute via ${trip.commuteMethod}\n` +
            `Distance: ${trip.distanceKm} km\n` +
            `Allowance: €${trip.totalAllowance}\n` +
            `From: ${trip.fromAddress}\n` +
            `To: ${trip.toAddress}` +
            (trip.notes ? `\n\nNotes: ${trip.notes}` : '')

        const tripDate = new Date(trip.tripDate)
        const startTime = trip.departureTime ? new Date(trip.departureTime) : tripDate
        const endTime = trip.arrivalTime ? new Date(trip.arrivalTime) :
            new Date(startTime.getTime() + (trip.actualDurationMinutes || 30) * 60000)

        const [updatedEvent] = await db
            .update(events)
            .set({
                title: eventTitle,
                description: eventDescription,
                startTime,
                endTime,
                location: `${trip.fromAddress} → ${trip.toAddress}`,
                updatedAt: new Date()
            })
            .where(eq(events.id, trip.calendarEventId))
            .returning()

        return updatedEvent
    } catch (error) {
        console.error('Failed to update trip calendar event:', error)
        throw error
    }
}

export async function deleteTripCalendarEvent(trip: CommuteTrip) {
    try {
        if (!trip.calendarEventId) {
            return
        }

        await db
            .delete(events)
            .where(eq(events.id, trip.calendarEventId))
    } catch (error) {
        console.error('Failed to delete trip calendar event:', error)
        throw error
    }
}
