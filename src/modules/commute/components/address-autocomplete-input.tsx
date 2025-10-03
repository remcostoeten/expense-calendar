"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { MapPin, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useGooglePlaces } from "../hooks/use-google-places"
import { cn } from "@/lib/utils"

type TAddressAutocompleteInputProps = {
  label: string
  placeholder?: string
  value?: string
  onChange: (address: {
    formattedAddress: string
    street: string
    postalCode: string
    city: string
    country: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }) => void
  error?: string
  required?: boolean
}

export function AddressAutocompleteInput({
  label,
  placeholder = "Search for an address...",
  value = "",
  onChange,
  error,
  required = false
}: TAddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    predictions,
    isLoading,
    error: placesError,
    selectedPlace,
    searchAddresses,
    selectPlace,
    clearSelection
  } = useGooglePlaces()

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    searchAddresses(newValue)
    
    if (newValue.length > 0) {
      setIsOpen(true)
    }
  }

  const handleSelectPrediction = async (prediction: any) => {
    const addressDetails = await selectPlace(prediction.placeId)
    
    if (addressDetails) {
      setInputValue(addressDetails.formattedAddress)
      onChange(addressDetails)
      setIsOpen(false)
    }
  }

  const handleClear = () => {
    setInputValue("")
    clearSelection()
    onChange({
      formattedAddress: "",
      street: "",
      postalCode: "",
      city: "",
      country: "",
      coordinates: { latitude: 0, longitude: 0 }
    })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="address-input">{label}</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between",
              error && "border-red-500",
              !inputValue && "text-muted-foreground"
            )}
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {inputValue || placeholder}
              </span>
            </div>
            {isLoading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder={placeholder}
              value={inputValue}
              onValueChange={handleInputChange}
              className="h-9"
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Searching addresses...</span>
                </div>
              )}
              
              {!isLoading && predictions.length === 0 && inputValue.length > 2 && (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No addresses found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a different search term
                    </p>
                  </div>
                </CommandEmpty>
              )}
              
              {!isLoading && predictions.length > 0 && (
                <CommandGroup>
                  {predictions.map((prediction) => (
                    <CommandItem
                      key={prediction.placeId}
                      value={prediction.description}
                      onSelect={() => handleSelectPrediction(prediction)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start space-x-2 flex-1">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {prediction.structuredFormatting.mainText}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {prediction.structuredFormatting.secondaryText}
                          </p>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedPlace && (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="text-sm">
              <p className="font-medium text-green-800 dark:text-green-200">
                 {selectedPlace.postalCode} {selectedPlace.city}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {selectedPlace.coordinates.latitude.toFixed(6)}, {selectedPlace.coordinates.longitude.toFixed(6)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            Clear
          </Button>
        </div>
      )}
      
      {(error || placesError) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error || placesError}
        </p>
      )}
      
      {required && !selectedPlace && inputValue.length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Please select an address from the dropdown
        </p>
      )}
    </div>
  )
}
