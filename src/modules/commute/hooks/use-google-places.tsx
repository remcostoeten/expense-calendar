"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { getAddressPredictionsAction, getAddressDetailsAction } from "../server/actions/google-places-action"
import type { TPlacePrediction } from "../server/services/google-places-service"

type TAddressDetails = {
  formattedAddress: string
  street: string
  postalCode: string
  city: string
  country: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

export function useGooglePlaces() {
  const [predictions, setPredictions] = useState<TPlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<TAddressDetails | null>(null)
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  const searchAddresses = useCallback(async (input: string) => {
    if (!input || input.length < 3) {
      setPredictions([])
      return
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const result = await getAddressPredictionsAction(input)
        
        if (result.success) {
          setPredictions(result.data)
        } else {
          setError(result.error || 'Failed to get address predictions')
          setPredictions([])
        }
      } catch (err) {
        setError('Failed to search addresses')
        setPredictions([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce
  }, [])

  const selectPlace = useCallback(async (placeId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getAddressDetailsAction(placeId)
      
      if (result.success) {
        const { placeDetails, parsedAddress, coordinates } = result.data
        
        const addressDetails: TAddressDetails = {
          formattedAddress: placeDetails.formattedAddress,
          street: parsedAddress.street,
          postalCode: parsedAddress.postalCode,
          city: parsedAddress.city,
          country: parsedAddress.country,
          coordinates
        }
        
        setSelectedPlace(addressDetails)
        setPredictions([]) // Clear predictions after selection
        return addressDetails
      } else {
        setError(result.error || 'Failed to get place details')
        return null
      }
    } catch (err) {
      setError('Failed to get place details')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPlace(null)
    setPredictions([])
    setError(null)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    predictions,
    isLoading,
    error,
    selectedPlace,
    searchAddresses,
    selectPlace,
    clearSelection
  }
}
