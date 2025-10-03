// Check if Google Maps is loaded
const isGoogleMapsLoaded = () => {
  return typeof window !== 'undefined' && 
         typeof google !== 'undefined' && 
         google.maps && 
         google.maps.places && 
         google.maps.geometry
}

// Wait for Google Maps to be loaded
const waitForGoogleMaps = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isGoogleMapsLoaded()) {
      resolve()
      return
    }
    
    const checkInterval = setInterval(() => {
      if (isGoogleMapsLoaded()) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)
    
    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve()
    }, 10000)
  })
}

// Address autocomplete interface
export interface AddressSuggestion {
  formatted_address: string
  place_id: string
  street_number?: string
  route?: string
  postal_code?: string
  locality?: string
  country?: string
}

// Get address suggestions from Google Places API
export const getAddressSuggestions = async (input: string): Promise<AddressSuggestion[]> => {
  await waitForGoogleMaps()
  
  if (!input.trim() || !isGoogleMapsLoaded()) return []
  
  const service = new google.maps.places.AutocompleteService()
  
  return new Promise((resolve) => {
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'nl' }, // Restrict to Netherlands
        types: ['address']
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const suggestions = predictions.map(prediction => ({
            formatted_address: prediction.description,
            place_id: prediction.place_id
          }))
          resolve(suggestions)
        } else {
          resolve([])
        }
      }
    )
  })
}

// Get detailed address information from place ID
export const getAddressDetails = async (placeId: string): Promise<AddressSuggestion | null> => {
  await waitForGoogleMaps()
  
  if (!isGoogleMapsLoaded()) return null
  
  const service = new google.maps.places.PlacesService(document.createElement('div'))
  
  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ['address_components', 'formatted_address']
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const addressComponents = place.address_components || []
          
          const suggestion: AddressSuggestion = {
            formatted_address: place.formatted_address || '',
            place_id: placeId
          }
          
          // Parse address components
          addressComponents.forEach(component => {
            const types = component.types
            
            if (types.includes('street_number')) {
              suggestion.street_number = component.long_name
            } else if (types.includes('route')) {
              suggestion.route = component.long_name
            } else if (types.includes('postal_code')) {
              suggestion.postal_code = component.long_name
            } else if (types.includes('locality')) {
              suggestion.locality = component.long_name
            } else if (types.includes('country')) {
              suggestion.country = component.long_name
            }
          })
          
          resolve(suggestion)
        } else {
          resolve(null)
        }
      }
    )
  })
}

// Calculate distance between two addresses using Google Maps Distance Matrix API
export const calculateDistance = async (
  origin: string,
  destination: string
): Promise<{ distance: number; duration: string } | null> => {
  await waitForGoogleMaps()
  
  if (!isGoogleMapsLoaded()) return null
  
  const service = new google.maps.DistanceMatrixService()
  
  return new Promise((resolve) => {
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      },
      (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          const element = response.rows[0]?.elements[0]
          
          if (element?.status === google.maps.DistanceMatrixElementStatus.OK) {
            const distance = element.distance.value / 1000 // Convert meters to kilometers
            const duration = element.duration.text
            
            resolve({ distance, duration })
          } else {
            resolve(null)
          }
        } else {
          resolve(null)
        }
      }
    )
  })
}

// Geocode an address to get coordinates
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  await waitForGoogleMaps()
  
  if (!isGoogleMapsLoaded()) return null
  
  const geocoder = new google.maps.Geocoder()
  
  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        const location = results[0].geometry.location
        resolve({
          lat: location.lat(),
          lng: location.lng()
        })
      } else {
        resolve(null)
      }
    })
  })
}