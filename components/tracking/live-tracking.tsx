"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Truck, CheckCircle, Package, Navigation, User, Car } from "lucide-react"
import { useSocket } from "@/components/providers"
import type { OrderStatus } from "@prisma/client"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues
const DeliveryMap = dynamic(() => import("./delivery-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gradient-to-br from-blue-100 to-indigo-100 animate-pulse rounded-2xl flex items-center justify-center">
      <div className="text-center text-indigo-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-lg font-semibold">Loading GPS tracking...</p>
        <p className="text-sm mt-1">Preparing your delivery map</p>
      </div>
    </div>
  ),
})

interface LiveTrackingProps {
  orderStatus: OrderStatus
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerAddress: string
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    label: "Order Received",
    description: "We've received your order and are processing it",
    color: "bg-gradient-to-r from-yellow-500 to-orange-500",
    textColor: "text-yellow-100",
    bgColor: "from-yellow-50 to-orange-50",
  },
  CONFIRMED: {
    icon: CheckCircle,
    label: "Confirmed by Restaurant",
    description: "Your order has been confirmed and is being prepared",
    color: "bg-gradient-to-r from-blue-500 to-indigo-500",
    textColor: "text-blue-100",
    bgColor: "from-blue-50 to-indigo-50",
  },
  PREPARING: {
    icon: Package,
    label: "Being Prepared",
    description: "The kitchen is working on your delicious meal",
    color: "bg-gradient-to-r from-orange-500 to-red-500",
    textColor: "text-orange-100",
    bgColor: "from-orange-50 to-red-50",
  },
  READY_FOR_PICKUP: {
    icon: Navigation,
    label: "Ready for Pickup",
    description: "Your order is ready and waiting for the driver",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    textColor: "text-purple-100",
    bgColor: "from-purple-50 to-pink-50",
  },
  OUT_FOR_DELIVERY: {
    icon: Truck,
    label: "Out for Delivery",
    description: "Your driver is on the way to deliver your order",
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    textColor: "text-green-100",
    bgColor: "from-green-50 to-emerald-50",
  },
  DELIVERED: {
    icon: CheckCircle,
    label: "Delivered",
    description: "Your order has been successfully delivered",
    color: "bg-gradient-to-r from-green-600 to-emerald-600",
    textColor: "text-green-100",
    bgColor: "from-green-50 to-emerald-50",
  },
  CANCELLED: {
    icon: Clock,
    label: "Cancelled",
    description: "This order has been cancelled",
    color: "bg-gradient-to-r from-red-500 to-pink-500",
    textColor: "text-red-100",
    bgColor: "from-red-50 to-pink-50",
  },
}

export function LiveTracking({ orderStatus, driverLocation, restaurantLocation, customerAddress }: LiveTrackingProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const currentStatus = statusConfig[orderStatus] || statusConfig.PENDING
  const StatusIcon = currentStatus.icon

  const getStatusSteps = () => {
    const steps = [
      { key: "PENDING", label: "Order Received" },
      { key: "CONFIRMED", label: "Confirmed" },
      { key: "PREPARING", label: "Preparing" },
      { key: "READY_FOR_PICKUP", label: "Ready" },
      { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
      { key: "DELIVERED", label: "Delivered" },
    ]

    const currentIndex = steps.findIndex((step) => step.key === orderStatus)

    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: step.key === orderStatus,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className={`bg-gradient-to-br ${currentStatus.bgColor} border-0 shadow-xl overflow-hidden`}>
        <CardHeader className={`${currentStatus.color} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <StatusIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{currentStatus.label}</CardTitle>
                <p className={`${currentStatus.textColor} text-lg`}>{currentStatus.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`${currentStatus.textColor} text-sm`}>Last Updated</p>
              <p className="text-white font-semibold">{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {getStatusSteps().map((step, index) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`w-4 h-4 rounded-full mb-2 transition-all duration-300 ${
                    step.isActive
                      ? step.isCurrent
                        ? "bg-gradient-to-r from-orange-500 to-red-500 ring-4 ring-orange-200 scale-125"
                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-xs font-medium text-center ${step.isActive ? "text-gray-800" : "text-gray-500"}`}
                >
                  {step.label}
                </span>
                {index < getStatusSteps().length - 1 && (
                  <div
                    className={`absolute h-0.5 w-full mt-2 transition-all duration-300 ${
                      step.isActive ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-300"
                    }`}
                    style={{
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: `${100 / (getStatusSteps().length - 1)}%`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm font-medium text-gray-600">
              {isConnected ? "Live tracking active" : "Reconnecting..."}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Map Section - Made bigger with increased height */}
      <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="text-xl font-bold flex items-center">
            <Navigation className="h-6 w-6 mr-2" />
            Live GPS Tracking
            {driverLocation && orderStatus === "OUT_FOR_DELIVERY" && (
              <div className="flex items-center space-x-2 ml-auto">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold bg-green-400 text-green-900 px-3 py-1 rounded-full">LIVE</span>
              </div>
            )}
          </CardTitle>
          <p className="text-blue-100">Real-time delivery location updates</p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Increased map height from 400px to 600px */}
          <div className="h-[600px] w-full">
            <DeliveryMap
              driverLocation={driverLocation}
              restaurantLocation={restaurantLocation}
              customerAddress={customerAddress}
              orderStatus={orderStatus}
            />
          </div>
        </CardContent>
      </Card>

      {/* Driver Info Card - Only show when out for delivery */}
      {orderStatus === "OUT_FOR_DELIVERY" && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle className="flex items-center text-lg">
              <Car className="h-5 w-5 mr-2" />
              Your Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-full">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">Driver on the way</h3>
                <p className="text-gray-600">Your order is being delivered with live GPS tracking</p>
                <Badge className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  En Route
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">ETA</p>
                <p className="font-bold text-lg text-gray-800">15-25 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
