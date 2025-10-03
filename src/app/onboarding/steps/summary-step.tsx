"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Car, Bus, Footprints, Bike, MapPin, Calendar, Euro } from "lucide-react"
import type { TOnboarding } from "../onboarding-flow"

type TProps = { 
  data: TOnboarding
  updateData: (updates: Partial<TOnboarding>) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completeOnboarding: () => void
}

const DAYS = [
  { id: 0, name: 'Sunday', short: 'Su' },
  { id: 1, name: 'Monday', short: 'Mo' },
  { id: 2, name: 'Tuesday', short: 'Tu' },
  { id: 3, name: 'Wednesday', short: 'We' },
  { id: 4, name: 'Thursday', short: 'Th' },
  { id: 5, name: 'Friday', short: 'Fr' },
  { id: 6, name: 'Saturday', short: 'Sa' },
]

const COMMUTE_METHOD_ICONS = {
  car: Car,
  public_transport: Bus,
  walking: Footprints,
  bike: Bike,
}

export function SummaryStep({
  data,
  completeOnboarding
}: TProps) {
  const CommuteIcon = COMMUTE_METHOD_ICONS[data.commuteMethod]
  const commuteMethodName = data.commuteMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())

  const calculateWeeklyAllowance = () => {
    let weeklyAllowance = 0

    if (data.hasFixedOfficeDays) {
      const officeDaysCount = data.fixedOfficeDays.length
      const kmAllowance = officeDaysCount * 2 * parseFloat(data.distanceKm?.toString() || '0') * data.kmAllowance
      weeklyAllowance += kmAllowance
    }

    if (data.hasHomeOfficeAllowance) {
      const homeOfficeDaysCount = data.homeOfficeDays.length
      const homeOfficeAllowance = homeOfficeDaysCount * data.homeOfficeAllowance
      weeklyAllowance += homeOfficeAllowance
    }

    return weeklyAllowance
  }

  const weeklyAllowance = calculateWeeklyAllowance()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your Setup</h2>
        <p className="text-muted-foreground">
          Please review your commute profile before completing setup
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CommuteIcon className="h-5 w-5" />
              Commute Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{commuteMethodName}</p>
                {data.commuteMethod === 'car' && (
                  <p className="text-sm text-muted-foreground">
                    €{data.kmAllowance} per km
                  </p>
                )}
                {data.commuteMethod === 'public_transport' && (
                  <p className="text-sm text-muted-foreground">
                    €{data.publicTransportCost} per month
                  </p>
                )}
                {(data.commuteMethod === 'walking' || data.commuteMethod === 'bike') && (
                  <p className="text-sm text-muted-foreground">
                    No allowance
                  </p>
                )}
              </div>
              <Badge variant="secondary">{commuteMethodName}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Home</p>
              <p className="font-medium">{data.homeAddress}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Office</p>
              <p className="font-medium">{data.officeAddress}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">
                Distance: {data.distanceKm} km
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Office Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Office Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.hasFixedOfficeDays ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fixed office days:</p>
                <div className="flex gap-1">
                  {data.fixedOfficeDays.map(dayId => {
                    const day = DAYS.find(d => d.id === dayId)
                    return (
                      <Badge key={dayId} variant="default">
                        {day?.short}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Flexible office days - can be filled in manually
              </p>
            )}
          </CardContent>
        </Card>

        {/* Home Office */}
        {data.hasHomeOfficeAllowance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🏠</span>
                Home Office Allowance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Home office days:</p>
                <div className="flex gap-1">
                  {data.homeOfficeDays.map(dayId => {
                    const day = DAYS.find(d => d.id === dayId)
                    return (
                      <Badge key={dayId} variant="outline">
                        {day?.short}
                      </Badge>
                    )
                  })}
                </div>
                <p className="text-sm text-muted-foreground">
                  €{data.homeOfficeAllowance} per day
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Weekly Allowance Estimate
            </CardTitle>
            <CardDescription>
              Based on your current settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                €{weeklyAllowance.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                per week
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Button 
          onClick={completeOnboarding} 
          className="w-full"
          size="lg"
        >
          Complete Setup & Start Tracking
        </Button>
      </div>
    </div>
  )
}