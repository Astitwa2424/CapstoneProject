"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign, Navigation, ExternalLink, Star } from "lucide-react"
import dynamic from "next/dynamic"
import { useSocket } from "@/components/providers" // Import the hook
import { acceptOrder, toggleDriverAvailability, completeDelivery, updateDriverLocation } from "@/app/driver/actions"

const DriverMap = dynamic(() => import("@/components/tracking/driver-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />,
})

const DriverDeliveryMap = dynamic(() => import("@/components/tracking/driver-delivery-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />,
})

interface DriverProfile {
  id: string
  userId: string
  isAvailable: boolean
  user: {
    name: string | null
    email: string
  }
}

interface DashboardStats {
  todaysEarnings: string
  completedDeliveries: number
  averageRating: string
  activeHours: string
}

interface Order {
  id: string
  status: string
  total: number
  deliveryAddress: string
  deliveryLat: number | null
  deliveryLng: number | null
  restaurant: {
    id: string
    name: string
    address: string
    mapLatitude: number | null
    mapLongitude: number | null
  }
}

interface DriverDashboardContentProps {
  initialDriver: DriverProfile
  initialStats: DashboardStats | null
  initialOrders: Order[]
}

export function DriverDashboardContent({ initialDriver, initialStats, initialOrders }: DriverDashboardContentProps) {
  const [driver, setDriver] = useState(initialDriver)
  const [stats, setStats] = useState(initialStats)
  const [availableOrders, setAvailableOrders] = useState<Order[]>(initialOrders)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const { socket } = useSocket()

  // Get driver's current location for Australian operations
  useEffect(() => {
    if (driver.isAvailable && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          // Validate location is in Australia
          const lat = newLocation.lat
          const lng = newLocation.lng

          if (lat >= -44 && lat <= -9 && lng >= 112 && lng <= 154) {
            setDriverLocation(newLocation)
            setIsLocationEnabled(true)
            updateDriverLocation(lat, lng)
          } else {
            console.warn("Driver location is outside Australia bounds")
            setIsLocationEnabled(false)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setIsLocationEnabled(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [driver.isAvailable])

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    socket.on("new-order", (order: Order) => {
      if (driver.isAvailable) {
        setAvailableOrders((prev) => [order, ...prev])
      }
    })

    socket.on("order-accepted", (orderId: string) => {
      setAvailableOrders((prev) => prev.filter((order) => order.id !== orderId))
    })

    return () => {
      socket.off("new-order")
      socket.off("order-accepted")
    }
  }, [socket, driver.isAvailable])

  const handleToggleAvailability = async () => {
    setIsLoading(true)
    try {
      const newAvailability = await toggleDriverAvailability()
      setDriver((prev) => ({ ...prev, isAvailable: newAvailability }))

      if (!newAvailability) {
        setDriverLocation(null)
        setIsLocationEnabled(false)
        setActiveOrder(null)
        setShowNavigation(false)
      }
    } catch (error) {
      console.error("Failed to toggle availability:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    setIsLoading(true)
    try {
      const acceptedOrderData = await acceptOrder(orderId)
      const acceptedOrder = availableOrders.find((order) => order.id === orderId)
      if (acceptedOrder && acceptedOrderData) {
        // Update the order with delivery coordinates from the accepted order data
        const orderWithCoords = {
          ...acceptedOrder,
          deliveryLat: acceptedOrderData.deliveryLat,
          deliveryLng: acceptedOrderData.deliveryLng,
        }
        setActiveOrder(orderWithCoords)
        setAvailableOrders((prev) => prev.filter((order) => order.id !== orderId))
        setShowNavigation(true) // Show navigation interface when order is accepted
      }
    } catch (error) {
      console.error("Failed to accept order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteDelivery = async () => {
    if (!activeOrder) return

    setIsLoading(true)
    try {
      await completeDelivery(activeOrder.id)
      setActiveOrder(null)
      setShowNavigation(false)
      // Refresh stats
      window.location.reload()
    } catch (error) {
      console.error("Failed to complete delivery:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openGoogleMapsNavigation = (deliveryAddress: string, lat?: number, lng?: number) => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=`

    if (lat && lng) {
      url += `${lat},${lng}`
    } else {
      url += encodeURIComponent(deliveryAddress)
    }

    // Add Australian region parameter for better local results
    url += `&region=AU`

    window.open(url, "_blank")
  }

  const toggleNavigationView = () => {
    setShowNavigation(!showNavigation)
  }

  if (!driver) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Driver Profile Not Found</h2>
          <p className="text-gray-500">Please contact support to set up your driver profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                FoodHub Driver
              </h1>
              <p className="text-slate-400 mt-1">Welcome back, {driver.user.name || "Driver"}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={driver.isAvailable ? "default" : "secondary"} className="px-3 py-1">
                {driver.isAvailable ? "Online" : "Offline"}
              </Badge>
              {activeOrder && (
                <Button
                  onClick={toggleNavigationView}
                  variant={showNavigation ? "secondary" : "default"}
                  className="min-w-[120px]"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {showNavigation ? "Hide Navigation" : "Show Navigation"}
                </Button>
              )}
              <Button
                onClick={handleToggleAvailability}
                variant={driver.isAvailable ? "destructive" : "default"}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "..." : driver.isAvailable ? "Go Offline" : "Go Online"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Navigation Map for Active Delivery */}
        {showNavigation && activeOrder && driverLocation && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-green-400" />
                  Navigation to Delivery
                  <Badge variant="outline" className="border-green-500 text-green-400 ml-2">
                    ACTIVE DELIVERY
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      openGoogleMapsNavigation(
                        activeOrder.deliveryAddress,
                        activeOrder.deliveryLat || undefined,
                        activeOrder.deliveryLng || undefined,
                      )
                    }
                    className="border-blue-400 text-blue-400 hover:bg-blue-400/20"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in Google Maps
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCompleteDelivery}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Delivery
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-400">
                <p>
                  <strong>Restaurant:</strong> {activeOrder.restaurant.name}
                </p>
                <p>
                  <strong>Delivery to:</strong> {activeOrder.deliveryAddress}
                </p>
                <p>
                  <strong>Order Value:</strong> ${activeOrder.total.toFixed(2)}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <DriverDeliveryMap
                  driverLocation={driverLocation}
                  restaurantLocation={{
                    lat: activeOrder.restaurant.mapLatitude || 0,
                    lng: activeOrder.restaurant.mapLongitude || 0,
                  }}
                  customerAddress={activeOrder.deliveryAddress}
                  orderStatus="OUT_FOR_DELIVERY"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Australian GPS Map - Overview */}
        {!showNavigation && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-400" />
                Australian Delivery Map
                {isLocationEnabled && (
                  <Badge variant="outline" className="ml-auto border-green-500 text-green-400">
                    GPS Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-lg overflow-hidden">
                <DriverMap
                  driverLocation={driverLocation}
                  availableOrders={availableOrders}
                  activeOrder={activeOrder}
                />
              </div>
              {!isLocationEnabled && driver.isAvailable && (
                <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    🌏 Please enable location services to see your position on the Australian delivery map
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Orders */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-400" />
                Available Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!driver.isAvailable ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Go online to see available orders</p>
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No orders available</p>
                  <p className="text-sm mt-2">New orders will appear here automatically</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-slate-600 rounded-lg hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{order.restaurant.name}</h4>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {order.restaurant.address}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          ${order.total.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-slate-300 text-sm">Deliver to: {order.deliveryAddress}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="space-y-6">
            {/* Active Delivery */}
            {activeOrder && (
              <Card className="bg-green-600/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400">Active Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-white">{activeOrder.restaurant.name}</h4>
                      <p className="text-green-200 text-sm">Deliver to: {activeOrder.deliveryAddress}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-green-400 text-green-400">
                        ${activeOrder.total.toFixed(2)}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={toggleNavigationView}
                          className="border-blue-400 text-blue-400 hover:bg-blue-400/20 bg-transparent"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          {showNavigation ? "Hide Nav" : "Navigate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openGoogleMapsNavigation(
                              activeOrder.deliveryAddress,
                              activeOrder.deliveryLat || undefined,
                              activeOrder.deliveryLng || undefined,
                            )
                          }
                          className="border-blue-400 text-blue-400 hover:bg-blue-400/20"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          External
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      Today's Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-green-400">${stats.todaysEarnings}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-blue-400">{stats.completedDeliveries}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-yellow-400">{stats.averageRating}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-400" />
                      Active Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl font-bold text-purple-400">{stats.activeHours}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
