"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, Navigation, Gauge } from "lucide-react"
import type { google } from "google-maps"

interface RouteInfoBoxProps {
  distance: string | null
  time: string | null
  speed?: string | null
  directions?: google.maps.DirectionsResult | null
}

export function RouteInfoBox({ distance, time, speed, directions }: RouteInfoBoxProps) {
  // If we have Google Maps directions, extract info from there
  const routeDistance = directions?.routes[0]?.legs[0]?.distance?.text || distance
  const routeTime = directions?.routes[0]?.legs[0]?.duration?.text || time
  const routeSpeed = speed

  if (!routeDistance && !routeTime && !routeSpeed) {
    return null
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-6 text-sm">
            {routeDistance && (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Navigation className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Distance</p>
                  <p className="font-bold text-gray-800">{routeDistance}</p>
                </div>
              </div>
            )}

            {routeTime && (
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">ETA</p>
                  <p className="font-bold text-gray-800">{routeTime}</p>
                </div>
              </div>
            )}

            {routeSpeed && (
              <div className="flex items-center space-x-2">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Gauge className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Speed</p>
                  <p className="font-bold text-gray-800">{routeSpeed}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
