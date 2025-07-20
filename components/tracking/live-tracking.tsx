"use client"

import { Truck, ChefHat, PackageCheck, Home, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@prisma/client"
import DeliveryMap from "./delivery-map"

interface LiveTrackingProps {
  orderStatus: OrderStatus
  driverLocation: { lat: number; lng: number } | null
  restaurantLocation: { lat: number; lng: number }
  customerAddress: string
}

const statusSteps = [
  { status: "PENDING", label: "Order Placed", icon: PackageCheck },
  { status: "PREPARING", label: "Preparing", icon: ChefHat },
  { status: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: Truck },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Home },
]

const statusOrder: OrderStatus[] = ["PENDING", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"]

export default function LiveTracking({
  orderStatus,
  driverLocation,
  restaurantLocation,
  customerAddress,
}: LiveTrackingProps) {
  const currentStatusIndex = statusOrder.indexOf(orderStatus)

  const showMap =
    currentStatusIndex >= statusOrder.indexOf("READY_FOR_PICKUP") &&
    currentStatusIndex < statusOrder.indexOf("DELIVERED")

  return (
    <div className="w-full">
      <div className="relative h-96 mb-8 bg-gray-200 rounded-lg overflow-hidden shadow-md">
        {showMap ? (
          <DeliveryMap
            driverLocation={driverLocation}
            restaurantLocation={restaurantLocation}
            customerAddress={customerAddress}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Map will appear here once the order is on its way.</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Track your order</h2>
        <p className="text-muted-foreground">Follow your meal from the kitchen to your door.</p>
      </div>

      <div className="relative w-full">
        {/* Progress Bar */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div
            className="h-full bg-gray-800 transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (statusSteps.length - 2)) * 100}%` }}
          />
        </div>

        {/* Status Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            if (step.status === "READY_FOR_PICKUP" && orderStatus !== "READY_FOR_PICKUP") return null
            if (step.status === "PREPARING" && orderStatus === "READY_FOR_PICKUP") return null

            const stepIndex = statusOrder.indexOf(step.status as OrderStatus)
            const isActive = stepIndex <= currentStatusIndex
            const isCurrent = stepIndex === currentStatusIndex

            return (
              <div key={step.status} className="flex flex-col items-center text-center w-24 z-10 bg-background">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    isActive ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-300 text-gray-400",
                  )}
                >
                  {currentStatusIndex > stepIndex ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <p
                  className={cn(
                    "mt-2 text-xs sm:text-sm font-medium",
                    isCurrent ? "text-gray-900" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
