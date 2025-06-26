"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Phone, Clock, Truck } from "lucide-react"

interface LiveTrackingProps {
  orderId: string
  driverName?: string
  driverPhone?: string
  estimatedTime?: number
}

export function LiveTracking({
  orderId,
  driverName = "John Doe",
  driverPhone = "+1-555-0123",
  estimatedTime = 15,
}: LiveTrackingProps) {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 37.7749,
    lng: -122.4194,
    address: "123 Main St, San Francisco, CA",
  })
  const [orderStatus, setOrderStatus] = useState("picked_up")
  const [eta, setEta] = useState(estimatedTime)

  // Simulate real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate driver movement
      setCurrentLocation((prev) => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }))

      // Update ETA
      setEta((prev) => Math.max(1, prev - 0.5))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const statusConfig = {
    confirmed: { color: "bg-blue-100 text-blue-700", text: "Order Confirmed" },
    preparing: { color: "bg-yellow-100 text-yellow-700", text: "Being Prepared" },
    ready: { color: "bg-orange-100 text-orange-700", text: "Ready for Pickup" },
    picked_up: { color: "bg-purple-100 text-purple-700", text: "Out for Delivery" },
    delivered: { color: "bg-green-100 text-green-700", text: "Delivered" },
  }

  return (
    <div className="space-y-6">
      {/* Order Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Order #{orderId}</span>
            </CardTitle>
            <Badge className={statusConfig[orderStatus as keyof typeof statusConfig].color}>
              {statusConfig[orderStatus as keyof typeof statusConfig].text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Estimated arrival:</span>
              <span className="font-semibold">{Math.ceil(eta)} minutes</span>
            </div>
            <Button size="sm" variant="outline">
              <Navigation className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info */}
      <Card>
        <CardHeader>
          <CardTitle>Your Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="font-semibold text-gray-600">
                  {driverName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-semibold">{driverName}</p>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.9</span>
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4 mr-2" />
              Call Driver
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Live Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Map placeholder with animated driver icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                  {driverName}
                </div>
              </div>

              {/* Destination marker */}
              <div className="absolute top-1/4 right-1/4">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Route line */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 50% 50% Q 60% 30% 75% 25%"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
              </svg>
            </div>

            <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow">
              <p className="text-sm font-medium">Current Location:</p>
              <p className="text-xs text-gray-600">{currentLocation.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { status: "confirmed", text: "Order confirmed", time: "2:30 PM", completed: true },
              { status: "preparing", text: "Restaurant preparing", time: "2:35 PM", completed: true },
              { status: "ready", text: "Ready for pickup", time: "2:50 PM", completed: true },
              { status: "picked_up", text: "Out for delivery", time: "3:00 PM", completed: true },
              { status: "delivered", text: "Delivered", time: "3:15 PM", completed: false },
            ].map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${step.completed ? "bg-green-500" : "bg-gray-300"}`} />
                <div className="flex-1">
                  <p className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}>{step.text}</p>
                  <p className="text-sm text-gray-500">{step.completed ? step.time : "Estimated " + step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
