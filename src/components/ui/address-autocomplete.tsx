"use client"

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddressAutocomplete } from '@/hooks/use-address-autocomplete'
import { cn } from '@/lib/utils'
import { Loader2, MapPin } from 'lucide-react'

interface AddressAutocompleteProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (address: {
    street: string
    postalCode: string
    city: string
    fullAddress: string
  }) => void
  className?: string
  disabled?: boolean
}

export function AddressAutocomplete({
  label,
  placeholder = "Enter address...",
  value,
  onChange,
  onAddressSelect,
  className,
  disabled = false
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const {
    input,
    suggestions,
    isLoading,
    selectedAddress,
    showSuggestions,
    handleInputChange,
    handleSuggestionSelect,
    clearSuggestions
  } = useAddressAutocomplete()

  // Sync external value with internal state
  useEffect(() => {
    if (value !== input) {
      handleInputChange(value)
    }
  }, [value])

  // Handle address selection
  useEffect(() => {
    if (selectedAddress && onAddressSelect) {
      const street = selectedAddress.street_number && selectedAddress.route 
        ? `${selectedAddress.street_number} ${selectedAddress.route}`
        : selectedAddress.route || ''
      
      const postalCode = selectedAddress.postal_code || ''
      const city = selectedAddress.locality || ''
      
      onAddressSelect({
        street,
        postalCode,
        city,
        fullAddress: selectedAddress.formatted_address
      })
    }
  }, [selectedAddress, onAddressSelect])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    handleInputChange(newValue)
    setIsOpen(true)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: any) => {
    onChange(suggestion.formatted_address)
    handleSuggestionSelect(suggestion)
    setIsOpen(false)
  }

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  // Handle input blur
  const handleBlur = () => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => setIsOpen(false), 150)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && <Label className="mb-2 block">{label}</Label>}
      
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {suggestion.formatted_address}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}