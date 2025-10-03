"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DAYS } from "@/modules/onboarding/constants"
import type { TStepProps } from "@/modules/onboarding/types"

export function HomeOfficeStep({ data, updateData, nextStep }: TStepProps) {
  const [hasHomeOfficeAllowance, setHasHomeOfficeAllowance] = useState<boolean>(
    data.hasHomeOfficeAllowance
  )
  const [selectedDays, setSelectedDays] = useState<number[]>(
    data.homeOfficeDays || []
  )

  const handleHomeOfficeChange = useCallback(function(value: string) {
    const hasAllowance = value === 'yes'
    setHasHomeOfficeAllowance(hasAllowance)
    
    if (!hasAllowance) {
      setSelectedDays([])
    }
    
    updateData({
      hasHomeOfficeAllowance: hasAllowance,
      homeOfficeDays: hasAllowance ? selectedDays : []
    })
  }, [selectedDays, updateData])

  const toggleDay = useCallback(function(dayId: number) {
    if (data.fixedOfficeDays.includes(dayId)) {
      return
    }

    setSelectedDays(prev => {
      const newSelectedDays = prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
      
      updateData({ homeOfficeDays: newSelectedDays })
      return newSelectedDays
    })
  }, [data.fixedOfficeDays, updateData])

  const clearSelection = useCallback(function() {
    setSelectedDays([])
    updateData({ homeOfficeDays: [] })
  }, [updateData])

  const isDayDisabled = useCallback(function(dayId: number): boolean {
    return data.fixedOfficeDays.includes(dayId)
  }, [data.fixedOfficeDays])

  const selectedDayNames = useMemo(function() {
    return selectedDays.map(id => DAYS.find(d => d.id === id)?.name).join(', ')
  }, [selectedDays])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Home Office Allowance</h2>
        <p className="text-muted-foreground">
          Do you get an allowance for working from home?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏠</span>
            Home Office Allowance
          </CardTitle>
          <CardDescription>
            Select if you receive an allowance for working from home and which days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            value={hasHomeOfficeAllowance ? 'yes' : 'no'} 
            onValueChange={handleHomeOfficeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="flex-1">
                <div>
                  <p className="font-medium">Yes, I get a home office allowance</p>
                  <p className="text-sm text-muted-foreground">
                    Select which days you work from home and get the allowance
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="flex-1">
                <div>
                  <p className="font-medium">No, I don't get a home office allowance</p>
                  <p className="text-sm text-muted-foreground">
                    Skip home office allowance calculations
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {hasHomeOfficeAllowance && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select your home office days:</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map(function(day) {
                  const isSelected = selectedDays.includes(day.id)
                  const isDisabled = isDayDisabled(day.id)
                  
                  return (
                    <Button
                      key={day.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`flex flex-col h-12 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => toggleDay(day.id)}
                      disabled={isDisabled}
                    >
                      <span className="text-xs">{day.short}</span>
                      <span className="text-xs">{day.name.slice(0, 3)}</span>
                    </Button>
                  )
                })}
              </div>

              {data.fixedOfficeDays.length > 0 && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <p className="font-medium">Note:</p>
                  <p>
                    Days marked as office days are disabled. You can only select home office days 
                    for days when you don't go to the office.
                  </p>
                </div>
              )}

              {selectedDays.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Selected home office days: {selectedDayNames}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button onClick={nextStep} className="w-full">
          Continue
        </Button>
      </div>
    </div>
  )
}