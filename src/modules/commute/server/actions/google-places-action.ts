"use server"

import { getPlacePredictions, getPlaceDetails, parseDutchAddress } from "../services/google-places-service"

export async function getAddressPredictionsAction(input: string) {
  try {
    const predictions = await getPlacePredictions(input, "nl")
    
    return {
      success: true,
      data: predictions
    }
  } catch (error) {
    console.error("Failed to get address predictions:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get address predictions"
    }
  }
}

export async function getAddressDetailsAction(placeId: string) {
  try {
    const placeDetails = await getPlaceDetails(placeId)
    
    if (!placeDetails) {
      return {
        success: false,
        error: "Place not found"
      }
    }
    
    const parsedAddress = await parseDutchAddress(placeDetails.addressComponents)
    
    return {
      success: true,
      data: {
        placeDetails,
        parsedAddress,
        coordinates: {
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng
        }
      }
    }
  } catch (error) {
    console.error("Failed to get address details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get address details"
    }
  }
}
