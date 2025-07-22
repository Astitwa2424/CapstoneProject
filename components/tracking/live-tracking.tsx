"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import type { OrderStatus } from "@prisma/client"
import { Package, ChefHat, Bike, Home, Check } from 'lucide-react'

// Dynamically import the map component to prevent SSR issues with Leaflet
const DeliveryMap = dynamic(() => import("./delivery-map"), {
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  ),
  ssr: false,
})

interface LiveTrackingProps {
  orderStatus: OrderStatus
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerAddress: string
}

const statusSteps = [
  { status: "NEW", label: "Order Placed", icon: Package },
  { status: "PREPARING", label: "Preparing", icon: ChefHat },
  { status: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: Bike },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Bike },
  { status: "DELIVERED", label: "Delivered", icon: Home },
]

export default function LiveTracking({
  orderStatus,
  driverLocation,
  restaurantLocation,
  customerAddress,
}: LiveTrackingProps) {
  const [eta, setEta] = useState<string | null>(null)
  
  // Find the index of the current status, treating READY_FOR_PICKUP and OUT_FOR_DELIVERY as the same visual step for the icon
  const activeStatusIndex = statusSteps.findIndex(
    (step) => step.status === orderStatus || (step.status === "READY_FOR_PICKUP" && orderStatus === "OUT_FOR_DELIVERY")
  )

  const handleEtaChange = (newEta: string) => {
    setEta(newEta)
  }

  const showMap = driverLocation && (orderStatus === "OUT_FOR_DELIVERY" || orderStatus === "DELIVERED")

  return (
    <div className="space-y-8">
      <div className="h-96 w-full bg-gray-100 rounded-lg overflow-hidden shadow-inner">
        {showMap ? (
          <DeliveryMap
            driverLocation={driverLocation}
            restaurantLocation={restaurantLocation}
            customerAddress={customerAddress}
            onEtaChange={handleEtaChange}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <ChefHat className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Your order is being prepared</h3>
            <p className="text-gray-500">The map will appear once your driver is on the way.</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Track your order</h2>
          {eta && orderStatus === "OUT_FOR_DELIVERY" && (
            <div className="text-right">
              <p className="font-semibold text-lg text-gray-800">{eta}</p>
              <p className="text-sm text-gray-500">Estimated arrival</p>
            </div>
          )}
        </div>
        <p className="text-muted-foreground mb-6">Follow your meal from the kitchen to your door.</p>
        
        <div className="flex justify-between items-start">
          {statusSteps.filter(s => s.status !== 'READY_FOR_PICKUP').map((step, index, arr) => {
            const isActive = index <= activeStatusIndex
            const isCompleted = index < activeStatusIndex
            
            return (
              <div key={step.status} className="flex-1 flex flex-col items-center relative">
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                  </div>
                </div>
                <p
                  className={`mt-2 text-xs font-semibold text-center transition-colors duration-300 ${
                    isActive ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {index < arr.length - 1 && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-0.5 transition-colors duration-300 ${
                      index < activeStatusIndex ? "bg-gray-900" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}