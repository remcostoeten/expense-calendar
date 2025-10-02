"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { OnboardingData } from "../onboarding-flow"

interface OfficeDaysStepProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => void
}

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mo' },
  { id: 2, name: 'Tuesday', short: 'Tu' },
  { id: 3, name: 'Wednesday', short: 'We' },
  { id: 4, name: 'Thursday', short: 'Th' },
  { id: 5, name: 'Friday', short: 'Fr' },
  { id: 6, name: 'Saturday', short: 'Sa' },
  { id: 0, name: 'Sunday', short: 'Su' },
]

export default function OfficeDaysStep({
  data,
  updateData,
  nextStep
}: OfficeDaysStepProps) {
  const [hasFixedOfficeDays, setHasFixedOfficeDays] = useState<boolean>(
    data.hasFixedOfficeDays
  )
  const [selectedDays, setSelectedDays] = useState<number[]>(
    data.fixedOfficeDays || []
  )

  const handleFixedDaysChange = (value: string) => {
    const hasFixed = value === 'yes'
    setHasFixedOfficeDays(hasFixed)
    
    if (!hasFixed) {
      setSelectedDays([])
    }
    
    updateData({
      hasFixedOfficeDays: hasFixed,
      fixedOfficeDays: hasFixed ? selectedDays : []
    })
  }

  const toggleDay = (dayId: number) => {
    const newSelectedDays = selectedDays.includes(dayId)
      ? selectedDays.filter(id => id !== dayId)
      : [...selectedDays, dayId]
    
    setSelectedDays(newSelectedDays)
    updateData({
      fixedOfficeDays: newSelectedDays
    })
  }

  const selectWeekdays = () => {
    const weekdays = [1, 2, 3, 4, 5] // Monday to Friday
    setSelectedDays(weekdays)
    updateData({
      fixedOfficeDays: weekdays
    })
  }

  const clearSelection = () => {
    setSelectedDays([])
    updateData({
      fixedOfficeDays: []
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Office Days</h2>
        <p className="text-muted-foreground">
          Do you have fixed days when you work at the office?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📅</span>
            Fixed Office Days
          </CardTitle>
          <CardDescription>
            Choose if you have a regular schedule for office days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup 
            value={hasFixedOfficeDays ? 'yes' : 'no'} 
            onValueChange={handleFixedDaysChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="flex-1">
                <div>
                  <p className="font-medium">Yes, I have fixed office days</p>
                  <p className="text-sm text-muted-foreground">
                    Select which days you typically work at the office
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="flex-1">
                <div>
                  <p className="font-medium">No, my office days vary</p>
                  <p className="text-sm text-muted-foreground">
                    You can manually fill in office/home days later
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {hasFixedOfficeDays && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select your office days:</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={selectWeekdays}
                  >
                    Weekdays
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.id)
                  return (
                    <Button
                      key={day.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="flex flex-col h-12"
                      onClick={() => toggleDay(day.id)}
                    >
                      <span className="text-xs">{day.short}</span>
                      <span className="text-xs">{day.name.slice(0, 3)}</span>
                    </Button>
                  )
                })}
              </div>

              {selectedDays.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Selected days: {selectedDays.map(id => DAYS.find(d => d.id === id)?.name).join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button 
          onClick={nextStep} 
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}