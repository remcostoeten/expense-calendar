import { NextResponse } from 'next/server'
import { getAuthenticatedContext } from '@/server/helpers/auth'

export async function GET() {
  try {
    const authResult = await getAuthenticatedContext()
    
    if (!authResult.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ 
      internalUserId: authResult.value.internalUserId 
    })
  } catch (error) {
    console.error('Error getting internal user ID:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}