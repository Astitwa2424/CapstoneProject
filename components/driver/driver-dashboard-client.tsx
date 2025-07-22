"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/components/providers/socket-provider"
import type {
  Order,
  RestaurantProfile,
  CustomerProfile,
  OrderItem,
  MenuItem,
  DriverProfile,
  User,
} from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, DollarSign, Star, Navigation } from "lucide-react"
import dynamic from "next/dynamic"
import { acceptOrder, updateDriverLocation, toggleDriverAvailability } from "@/app/driver/actions"

const DriverMap = dynamic(() => import("@/components/tracking/driver-map"), {
  ssr: false,
  loading: () => <div className="bg-gray-200 rounded-lg w-full h-full animate-pulse" />,
})

type OrderWithDetails = Order & {
  restaurant: RestaurantProfile & {
    user: User
  }
  customerProfile: CustomerProfile
  orderItems: (OrderItem & {
    menuItem: MenuItem
  })[]
}

type DriverProfileWithUser = DriverProfile & {
  user: User
}

interface DriverDashboardClientProps {
  driverProfile: DriverProfileWithUser
  initialStats: any
  initialOrders: OrderWithDetails[]
}

export function DriverDashboardClient({ driverProfile, initialStats, initialOrders }: DriverDashboardClientProps) {
  const [stats, setStats] = useState(initialStats)
  const [availableOrders, setAvailableOrders] = useState<OrderWithDetails[]>(initialOrders)
  const [isOnline, setIsOnline] = useState(driverProfile.isAvailable)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    driverProfile.latitude && driverProfile.longitude
      ? { lat: driverProfile.latitude, lng: driverProfile.longitude }
      : null,
  )
  const { socket } = useSocket()

  // Get current location and start tracking
  useEffect(() => {
    if (isOnline && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          updateDriverLocation(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [isOnline])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewOrder = (order: OrderWithDetails) => {
      setAvailableOrders((prev) => [order, ...prev])
    }

    const handleOrderTaken = (orderId: string) => {
      setAvailableOrders((prev) => prev.filter((order) => order.id !== orderId))
    }

    socket.on("new-order-available", handleNewOrder)
    socket.on("order-taken", handleOrderTaken)

    return () => {
      socket.off("new-order-available", handleNewOrder)
      socket.off("order-taken", handleOrderTaken)
    }
  }, [socket])

  const handleToggleOnline = async () => {
    try {
      const newStatus = await toggleDriverAvailability()
      setIsOnline(newStatus)
    } catch (error) {
      console.error("Error toggling availability:", error)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder(orderId)
      setAvailableOrders((prev) => prev.filter((order) => order.id !== orderId))
    } catch (error) {
      console.error("Error accepting order:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{driverProfile.user.name?.charAt(0) || "D"}</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{driverProfile.user.name || "Driver"}</h1>
                  <p className="text-sm text-gray-500">Driver Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "Online" : "Offline"}</Badge>
              <Button onClick={handleToggleOnline} variant={isOnline ? "destructive" : "default"}>
                {isOnline ? "Go Offline" : "Go Online"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Live Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <DriverMap driverLocation={currentLocation} availableOrders={availableOrders} />
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Today's Earnings</p>
                      <p className="text-lg font-semibold">${stats?.todaysEarnings || "0.00"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Deliveries</p>
                      <p className="text-lg font-semibold">{stats?.completedDeliveries || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="text-lg font-semibold">{stats?.averageRating || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hours</p>
                      <p className="text-lg font-semibold">{stats?.activeHours || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Available Orders */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Available Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {!isOnline ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Go online to see available orders</p>
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{order.restaurant.name}</h3>
                          <Badge variant="outline">${order.total.toFixed(2)}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{order.deliveryAddress}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>~15 mins</span>
                          </div>
                          <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>
                            Accept Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
