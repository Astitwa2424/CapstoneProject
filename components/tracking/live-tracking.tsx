"use client"

import { useState } from "react"
import { CheckCircle, CookingPot, Bike, Home, Loader2 } from "lucide-react"
import type { OrderStatus } from "@prisma/client"

const statusConfig = {
  PENDING: { index: 0, text: "Order Pending", icon: Loader2, color: "text-gray-500" },
  NEW: { index: 1, text: "Order Placed", icon: CheckCircle, color: "text-green-500" },
  ACCEPTED: { index: 1, text: "Order Accepted", icon: CheckCircle, color: "text-green-500" },
  PREPARING: { index: 2, text: "Preparing Food", icon: CookingPot, color: "text-yellow-500" },
  READY_FOR_PICKUP: { index: 3, text: "Ready for Pickup", icon: Bike, color: "text-blue-500" },
  OUT_FOR_DELIVERY: { index: 3, text: "Out for Delivery", icon: Bike, color: "text-blue-500" },
  DELIVERED: { index: 4, text: "Delivered", icon: Home, color: "text-purple-500" },
  CANCELLED: { index: -1, text: "Cancelled", icon: CheckCircle, color: "text-red-500" },
  FAILED: { index: -1, text: "Failed", icon: CheckCircle, color: "text-red-500" },
}

const steps = [
  { text: "Order Placed", icon: CheckCircle },
  { text: "Preparing Food", icon: CookingPot },
  { text: "Out for Delivery", icon: Bike },
  { text: "Delivered", icon: Home },
]

interface LiveTrackingProps {
  orderStatus: OrderStatus
}

export default function LiveTracking({ orderStatus }: LiveTrackingProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(orderStatus)
  const currentStepIndex = statusConfig[currentStatus]?.index ?? 0

  // In a real app, you'd use WebSockets (like Socket.IO) to update the status in real-time.
  // useEffect(() => {
  //   const socket = io("...");
  //   socket.on("orderStatusUpdate", (newStatus) => {
  //     setCurrentStatus(newStatus);
  //   });
  //   return () => socket.disconnect();
  // }, []);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Track Your Order</h2>
      <p className="text-muted-foreground mb-8">
        Current Status:{" "}
        <span className={`font-semibold ${statusConfig[currentStatus]?.color}`}>
          {statusConfig[currentStatus]?.text}
        </span>
      </p>

      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute left-6 top-0 h-full w-1 bg-gray-200 rounded-full" />
        <div
          className="absolute left-6 top-0 h-full w-1 bg-primary rounded-full transition-all duration-500"
          style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = step.icon

            return (
              <div key={index} className="flex items-center z-10 relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isCurrent ? "animate-pulse" : ""}`} />
                </div>
                <div className="ml-6">
                  <h3 className={`text-lg font-semibold ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                    {step.text}
                  </h3>
                  {isCurrent && <p className="text-sm text-muted-foreground">Estimated arrival: 10-15 mins</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-12 border-t pt-6">
        <h3 className="font-semibold mb-4">Your Driver</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <img src="/placeholder.svg?width=64&height=64" alt="Driver" className="rounded-full" />
          </div>
          <div>
            <p className="font-medium">Alex Johnson</p>
            <p className="text-sm text-muted-foreground">Honda Civic - ABC 123</p>
            <p className="text-sm text-yellow-500">★★★★☆ 4.8</p>
          </div>
          <div className="ml-auto">
            <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">📞</button>
          </div>
        </div>
      </div>
    </div>
  )
}
