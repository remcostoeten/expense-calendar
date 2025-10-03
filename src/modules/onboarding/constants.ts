import { Car, Bus, Footprints, Bike } from "lucide-react"

export type TDay = {
  id: number
  name: string
  short: string
}

export type TCommuteMethod = {
  id: 'car' | 'public_transport' | 'walking' | 'bike'
  name: string
  icon: typeof Car
  description: string
  defaultAllowance: number
}

export const DAYS: TDay[] = [
  { id: 1, name: 'Monday', short: 'Mo' },
  { id: 2, name: 'Tuesday', short: 'Tu' },
  { id: 3, name: 'Wednesday', short: 'We' },
  { id: 4, name: 'Thursday', short: 'Th' },
  { id: 5, name: 'Friday', short: 'Fr' },
  { id: 6, name: 'Saturday', short: 'Sa' },
  { id: 0, name: 'Sunday', short: 'Su' },
]

export const WEEKDAYS = [1, 2, 3, 4, 5]

export const COMMUTE_METHODS: TCommuteMethod[] = [
  {
    id: 'car',
    name: 'Car',
    icon: Car,
    description: '€0.23 per km allowance',
    defaultAllowance: 0.23
  },
  {
    id: 'public_transport',
    name: 'Public Transport',
    icon: Bus,
    description: 'Monthly subscription cost',
    defaultAllowance: 0
  },
  {
    id: 'walking',
    name: 'Walking',
    icon: Footprints,
    description: '€0 per km (no allowance)',
    defaultAllowance: 0
  },
  {
    id: 'bike',
    name: 'Bike',
    icon: Bike,
    description: '€0 per km (no allowance)',
    defaultAllowance: 0
  }
]
