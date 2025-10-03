"use server"

import { env } from "@/server/env"

export type TPlacePrediction = {
  placeId: string
  description: string
  structuredFormatting: {
    mainText: string
    secondaryText: string
  }
}

export type TPlaceDetails = {
  placeId: string
  formattedAddress: string
  addressComponents: Array<{
    longName: string
    shortName: string
    types: string[]
  }>
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types: string[]
}

export async function getPlacePredictions(
  input: string,
  country: string = "nl"
): Promise<TPlacePrediction[]> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:${country}&key=${env.GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', data.status, data.error_message)
      return []
    }
    
    return data.predictions?.map((prediction: any) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      structuredFormatting: {
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text
      }
    })) || []
  } catch (error) {
    console.error('Places API error:', error)
    return []
  }
}

export async function getPlaceDetails(placeId: string): Promise<TPlaceDetails | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,formatted_address,address_components,geometry,types&key=${env.GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.status !== 'OK') {
      console.error('Place details error:', data.status, data.error_message)
      return null
    }
    
    const result = data.result
    
    return {
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      addressComponents: result.address_components?.map((component: any) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types
      })) || [],
      geometry: {
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      },
      types: result.types || []
    }
  } catch (error) {
    console.error('Place details error:', error)
    return null
  }
}

export async function parseDutchAddress(addressComponents: TPlaceDetails['addressComponents']) {
  const components = addressComponents.reduce((acc, component) => {
    component.types.forEach(type => {
      acc[type] = component.longName
    })
    return acc
  }, {} as Record<string, string>)
  
  return {
    street: `${components.route || ''} ${components.street_number || ''}`.trim(),
    postalCode: components.postal_code || '',
    city: components.locality || components.postal_town || components.administrative_area_level_2 || '',
    country: components.country || 'Netherlands'
  }
}
