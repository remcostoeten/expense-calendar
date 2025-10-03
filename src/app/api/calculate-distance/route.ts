import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/server/env'

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json()

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      )
    }

    // Use Google Maps Distance Matrix API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=metric&key=${env.GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch distance data')
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`)
    }

    const element = data.rows[0]?.elements[0]

    if (!element || element.status !== 'OK') {
      throw new Error('Unable to calculate distance between addresses')
    }

    const distance = element.distance.value / 1000 // Convert meters to kilometers
    const duration = element.duration.text

    return NextResponse.json({
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      duration,
      success: true
    })

  } catch (error) {
    console.error('Distance calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    )
  }
}