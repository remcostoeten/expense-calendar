"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COMMUTE_METHODS } from "@/modules/onboarding/constants"
import type { TStepProps } from "@/modules/onboarding/types"

export function CommuteMethodStep({ data, updateData, nextStep }: TStepProps) {
  const [publicTransportCost, setPublicTransportCost] = useState<string>(
    data.publicTransportCost?.toString() || '0'
  )

  const handleMethodSelect = useCallback(function(method: typeof COMMUTE_METHODS[0]) {
    updateData({
      commuteMethod: method.id,
      kmAllowance: method.defaultAllowance,
      publicTransportCost: method.id === 'public_transport' ? parseFloat(publicTransportCost) : undefined
    })
  }, [publicTransportCost, updateData])

  const handlePublicTransportCostChange = useCallback(function(value: string) {
    setPublicTransportCost(value)
    if (data.commuteMethod === 'public_transport') {
      updateData({ publicTransportCost: parseFloat(value) || 0 })
    }
  }, [data.commuteMethod, updateData])

  const showPublicTransportInput = data.commuteMethod === 'public_transport'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">How do you commute to work?</h2>
        <p className="text-muted-foreground">
          Choose your primary commute method to calculate your allowances
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMMUTE_METHODS.map(function(method) {
          const Icon = method.icon
          const isSelected = data.commuteMethod === method.id

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleMethodSelect(method)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{method.name}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {showPublicTransportInput && (
        <div className="space-y-2">
          <Label htmlFor="public-transport-cost">Monthly subscription cost (€)</Label>
          <Input
            id="public-transport-cost"
            type="number"
            step="0.01"
            value={publicTransportCost}
            onChange={(e) => handlePublicTransportCostChange(e.target.value)}
            placeholder="e.g., 89.50"
          />
          <p className="text-sm text-muted-foreground">
            Enter your monthly public transport subscription cost
          </p>
        </div>
      )}

      <div className="pt-4">
        <Button 
          onClick={nextStep} 
          className="w-full"
          disabled={!data.commuteMethod}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}