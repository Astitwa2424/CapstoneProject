"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Clock } from "lucide-react"

interface OperatingHoursInputProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

interface DayHours {
  isOpen: boolean
  openTime: string
  closeTime: string
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

export function OperatingHoursInput({ value, onChange, disabled }: OperatingHoursInputProps) {
  // Parse existing value or set defaults
  const parseHours = (hoursString?: string): Record<string, DayHours> => {
    const defaultHours: Record<string, DayHours> = {}
    DAYS.forEach((day) => {
      defaultHours[day.key] = { isOpen: true, openTime: "09:00", closeTime: "22:00" }
    })

    if (!hoursString) return defaultHours

    // Try to parse existing format (simple fallback for now)
    return defaultHours
  }

  const [hours, setHours] = useState<Record<string, DayHours>>(parseHours(value))

  const updateHours = (newHours: Record<string, DayHours>) => {
    setHours(newHours)

    // Convert to string format for storage
    const hoursString = DAYS.map((day) => {
      const dayHours = newHours[day.key]
      if (!dayHours.isOpen) return `${day.label}: Closed`
      return `${day.label}: ${dayHours.openTime} - ${dayHours.closeTime}`
    }).join(", ")

    onChange(hoursString)
  }

  const updateDay = (dayKey: string, updates: Partial<DayHours>) => {
    const newHours = {
      ...hours,
      [dayKey]: { ...hours[dayKey], ...updates },
    }
    updateHours(newHours)
  }

  const copyToAll = (dayKey: string) => {
    const sourceDay = hours[dayKey]
    const newHours = { ...hours }
    DAYS.forEach((day) => {
      if (day.key !== dayKey) {
        newHours[day.key] = { ...sourceDay }
      }
    })
    updateHours(newHours)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map((day) => (
          <div key={day.key} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="w-20">
              <Label className="text-sm font-medium">{day.label}</Label>
            </div>

            <Switch
              checked={hours[day.key].isOpen}
              onCheckedChange={(isOpen) => updateDay(day.key, { isOpen })}
              disabled={disabled}
            />

            {hours[day.key].isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={hours[day.key].openTime}
                  onChange={(e) => updateDay(day.key, { openTime: e.target.value })}
                  disabled={disabled}
                  className="w-32"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="time"
                  value={hours[day.key].closeTime}
                  onChange={(e) => updateDay(day.key, { closeTime: e.target.value })}
                  disabled={disabled}
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToAll(day.key)}
                  disabled={disabled}
                  className="text-xs"
                >
                  Copy to all
                </Button>
              </div>
            ) : (
              <div className="flex-1 text-gray-500 text-sm">Closed</div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
