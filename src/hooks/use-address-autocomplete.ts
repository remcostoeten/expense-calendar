import { useState, useEffect, useCallback } from 'react'
import { getAddressSuggestions, getAddressDetails, type AddressSuggestion } from '@/lib/google-maps'

interface UseAddressAutocompleteOptions {
  debounceMs?: number
  minLength?: number
}

export const useAddressAutocomplete = (options: UseAddressAutocompleteOptions = {}) => {
  const { debounceMs = 300, minLength = 3 } = options
  
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Debounced search function
  const searchAddresses = useCallback(
    async (searchInput: string) => {
      if (searchInput.length < minLength) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const results = await getAddressSuggestions(searchInput)
        setSuggestions(results)
      } catch (error) {
        console.error('Error fetching address suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [minLength]
  )

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchAddresses(input)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [input, debounceMs, searchAddresses])

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value)
    setShowSuggestions(true)
    setSelectedAddress(null)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setInput(suggestion.formatted_address)
    setShowSuggestions(false)
    
    try {
      const details = await getAddressDetails(suggestion.place_id)
      if (details) {
        setSelectedAddress(details)
      }
    } catch (error) {
      console.error('Error fetching address details:', error)
    }
  }

  // Clear suggestions
  const clearSuggestions = () => {
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Reset hook state
  const reset = () => {
    setInput('')
    setSuggestions([])
    setIsLoading(false)
    setSelectedAddress(null)
    setShowSuggestions(false)
  }

  return {
    input,
    suggestions,
    isLoading,
    selectedAddress,
    showSuggestions,
    handleInputChange,
    handleSuggestionSelect,
    clearSuggestions,
    reset
  }
}