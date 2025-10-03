"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AddressAutocompleteInput } from "./address-autocomplete-input"
import { useCommuteManagement } from "@/server/api-hooks"
import { toast } from "sonner"

type TTripTemplateFormProps = {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TripTemplateForm({ onSuccess, onCancel }: TTripTemplateFormProps) {
  const { createTripTemplate, isLoading } = useCommuteManagement()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fromAddress: '',
    toAddress: '',
    fromCoordinates: { latitude: 0, longitude: 0 },
    toCoordinates: { latitude: 0, longitude: 0 },
    commuteMethod: 'car' as 'car' | 'public_transport' | 'walking' | 'bike',
    kmAllowance: 0.23,
    publicTransportCost: 0,
    homeOfficeAllowance: 2.00,
    isRecurring: false,
    recurrencePattern: 'weekdays' as 'daily' | 'weekly' | 'weekdays' | 'custom',
    recurrenceDays: [] as number[],
    addToCalendar: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createTripTemplate({
        name: formData.name,
        description: formData.description,
        fromAddress: formData.fromAddress,
        toAddress: formData.toAddress,
        commuteMethod: formData.commuteMethod,
        kmAllowance: formData.kmAllowance,
        publicTransportCost: formData.publicTransportCost,
        homeOfficeAllowance: formData.homeOfficeAllowance,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern,
        recurrenceDays: formData.recurrenceDays,
        addToCalendar: formData.addToCalendar
      })
      
      toast.success("Trip template created successfully!")
      
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to create trip template. Please try again.")
    }
  }

  const handleRecurrenceDaysChange = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: checked 
        ? [...prev.recurrenceDays, day]
        : prev.recurrenceDays.filter(d => d !== day)
    }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Trip Template</CardTitle>
        <CardDescription>
          Set up a reusable trip template for your commute routes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Daily Commute"
                required
              />
            </div>
            <div>
              <Label htmlFor="commuteMethod">Commute Method</Label>
              <Select
                value={formData.commuteMethod}
                onValueChange={(value: 'car' | 'public_transport' | 'walking' | 'bike') =>
                  setFormData(prev => ({ ...prev, commuteMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="public_transport">Public Transport</SelectItem>
                  <SelectItem value="walking">Walking</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description for this template"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressAutocompleteInput
              label="From Address"
              placeholder="Search for your home address..."
              value={formData.fromAddress}
              onChange={(address) => {
                setFormData(prev => ({
                  ...prev,
                  fromAddress: address.formattedAddress,
                  fromCoordinates: address.coordinates
                }))
              }}
              required
            />
            <AddressAutocompleteInput
              label="To Address"
              placeholder="Search for your office address..."
              value={formData.toAddress}
              onChange={(address) => {
                setFormData(prev => ({
                  ...prev,
                  toAddress: address.formattedAddress,
                  toCoordinates: address.coordinates
                }))
              }}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="kmAllowance">KM Allowance (€/km)</Label>
              <Input
                id="kmAllowance"
                type="number"
                step="0.01"
                value={formData.kmAllowance}
                onChange={(e) => setFormData(prev => ({ ...prev, kmAllowance: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="publicTransportCost">Public Transport Cost (€)</Label>
              <Input
                id="publicTransportCost"
                type="number"
                step="0.01"
                value={formData.publicTransportCost}
                onChange={(e) => setFormData(prev => ({ ...prev, publicTransportCost: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="homeOfficeAllowance">Home Office Allowance (€)</Label>
              <Input
                id="homeOfficeAllowance"
                type="number"
                step="0.01"
                value={formData.homeOfficeAllowance}
                onChange={(e) => setFormData(prev => ({ ...prev, homeOfficeAllowance: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
              />
              <Label htmlFor="isRecurring">Make this a recurring trip</Label>
            </div>

            {formData.isRecurring && (
              <div className="ml-6 space-y-4">
                <div>
                  <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
                  <Select
                    value={formData.recurrencePattern}
                    onValueChange={(value: 'daily' | 'weekly' | 'weekdays' | 'custom') =>
                      setFormData(prev => ({ ...prev, recurrencePattern: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrencePattern === 'custom' && (
                  <div>
                    <Label>Select Days</Label>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${index}`}
                            checked={formData.recurrenceDays.includes(index)}
                            onCheckedChange={(checked) => handleRecurrenceDaysChange(index, !!checked)}
                          />
                          <Label htmlFor={`day-${index}`} className="text-sm">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="addToCalendar"
                checked={formData.addToCalendar}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, addToCalendar: !!checked }))}
              />
              <Label htmlFor="addToCalendar">Add trips to calendar</Label>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
