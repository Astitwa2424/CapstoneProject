"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getOrderDetails } from "@/app/customer/actions"
import { LiveTracking } from "@/components/tracking/live-tracking"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Loader2, CheckCircle, Home, Phone, Star, User, Car, MapPin, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { toast } from "react-toastify"
import type {
  Order,
  OrderItem,
  RestaurantProfile,
  CustomerProfile,
  User as UserType,
  OrderStatus,
  DriverProfile,
} from "@prisma/client"
import { useSocket } from "@/components/providers"
import { usePolling } from "@/components/customer/polling-provider"
import { RefreshButton } from "@/components/ui/refresh-button"

type FullOrderItem = OrderItem & {
  menuItem: {
    name: string
  }
}

type FullOrder = Order & {
  orderItems: FullOrderItem[]
  restaurant: RestaurantProfile
  customerProfile: CustomerProfile & {
    user: UserType
  }
  driverProfile:
    | (DriverProfile & {
        user: UserType
      })
    | null
}

type DriverLocation = {
  lat: number
  lng: number
}

export default function TrackOrderPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<FullOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null)
  const [showDriverInfo, setShowDriverInfo] = useState(false)
  const [driverInfoShown, setDriverInfoShown] = useState(false)

  const { socket, isConnected } = useSocket()
  const { forceRefresh } = usePolling()

  useEffect(() => {
    const handlePollingRefresh = async () => {
      if (orderId && order && order.status !== "DELIVERED") {
        try {
          const orderDetails = (await getOrderDetails(orderId)) as FullOrder | null
          if (orderDetails) {
            setOrder(orderDetails)
            console.log("[v0] Order refreshed via polling:", orderDetails.status)
          }
        } catch (err) {
          console.error("[v0] Polling refresh failed:", err)
        }
      }
    }

    window.addEventListener("polling-refresh", handlePollingRefresh)
    window.addEventListener("force-refresh", handlePollingRefresh)

    return () => {
      window.removeEventListener("polling-refresh", handlePollingRefresh)
      window.removeEventListener("force-refresh", handlePollingRefresh)
    }
  }, [orderId, order])

  useEffect(() => {
    if (!orderId) return

    async function fetchOrder() {
      try {
        setLoading(true)
        const orderDetails = (await getOrderDetails(orderId)) as FullOrder | null
        if (orderDetails) {
          setOrder(orderDetails)
          if (orderDetails.status === "DELIVERED") return

          if (
            orderDetails.driverProfile &&
            orderDetails.driverProfile.latitude &&
            orderDetails.driverProfile.longitude
          ) {
            setDriverLocation({
              lat: orderDetails.driverProfile.latitude,
              lng: orderDetails.driverProfile.longitude,
            })
          }
        } else {
          setError("Order not found or you do not have permission to view it.")
        }
      } catch (err) {
        setError("Failed to fetch order details.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  useEffect(() => {
    if (order && order.status === "OUT_FOR_DELIVERY" && order.driverProfile && !driverInfoShown) {
      setShowDriverInfo(true)
      setDriverInfoShown(true)
    }
  }, [order, driverInfoShown])

  useEffect(() => {
    if (!order || order.status === "DELIVERED" || !socket || !isConnected) {
      console.log("[v0] Socket effect skipped:", {
        hasOrder: !!order,
        isDelivered: order?.status === "DELIVERED",
        hasSocket: !!socket,
        isConnected,
      })
      return
    }

    console.log("[v0] Setting up socket listeners for order:", order.id)

    const handleOrderStatusUpdate = (data: { orderId: string; status: OrderStatus; message?: string }) => {
      console.log("[v0] Order status update received:", data)
      if (data.orderId === order.id) {
        console.log("[v0] Updating order status from", order.status, "to", data.status)
        setOrder((prevOrder) => (prevOrder ? { ...prevOrder, status: data.status } : null))

        // Show toast notification for status changes
        if (data.message) {
          toast.info("Order Update", { description: data.message })
        }
      } else {
        console.log("[v0] Order ID mismatch:", data.orderId, "vs", order.id)
      }
    }

    const handleDriverLocationUpdate = (data: { orderId: string; lat: number; lng: number }) => {
      console.log("[v0] Driver location update:", data)
      if (data.orderId === order.id) {
        setDriverLocation({ lat: data.lat, lng: data.lng })
      }
    }

    const handleDriverAssigned = (data: { orderId: string; driverInfo: any }) => {
      console.log("[v0] Driver assigned:", data)
      if (data.orderId === order.id) {
        setOrder((prevOrder) => (prevOrder ? { ...prevOrder, driverProfile: data.driverInfo } : null))
        toast.success("Driver Assigned", {
          description: `${data.driverInfo.user?.name || "Your driver"} is on the way!`,
        })
      }
    }

    const room = `order_${order.id}`
    const userRoom = `user_${order.customerProfile.userId}`

    console.log("[v0] Joining rooms:", { room, userRoom })

    socket.emit("join-room", room)
    socket.emit("join-room", userRoom)

    socket.on("connect", () => {
      console.log("[v0] Socket connected, rejoining rooms")
      socket.emit("join-room", room)
      socket.emit("join-room", userRoom)
    })

    socket.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
    })

    socket.onAny((eventName, ...args) => {
      console.log("[v0] Socket event received:", eventName, args)
    })

    socket.on("order_notification", handleOrderStatusUpdate)
    socket.on("driver_location_update", handleDriverLocationUpdate)
    socket.on("driver_assigned", handleDriverAssigned)

    return () => {
      console.log("[v0] Cleaning up socket listeners")
      socket.off("order_notification", handleOrderStatusUpdate)
      socket.off("driver_location_update", handleDriverLocationUpdate)
      socket.off("driver_assigned", handleDriverAssigned)
      socket.off("connect")
      socket.off("disconnect")
      socket.offAny()
      socket.emit("leave-room", room)
      socket.emit("leave-room", userRoom)
    }
  }, [order, socket, isConnected])

  const handleManualRefresh = async () => {
    if (orderId) {
      try {
        const orderDetails = (await getOrderDetails(orderId)) as FullOrder | null
        if (orderDetails) {
          setOrder(orderDetails)
          toast.success("Order status refreshed")
        }
      } catch (err) {
        toast.error("Failed to refresh order status")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-gray-600 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-gray-200 rounded-full mx-auto"></div>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Loading your order...</h2>
          <p className="text-gray-600">Getting the latest updates</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 border border-gray-200">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/customer/dashboard">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  if (order.status === "DELIVERED") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
            <CardHeader className="bg-gray-900 text-white text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-4">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Order Delivered</CardTitle>
              <p className="text-gray-300 text-lg">Your order from {order.restaurant.name} has arrived</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-lg mb-4 text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-600" />
                    Order Summary
                  </h3>
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 text-gray-700">
                      <span className="font-medium">
                        {item.quantity} × {item.menuItem.name}
                      </span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-xl text-gray-900">
                    <span>Total</span>
                    <span className="text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Link href="/customer/dashboard">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-300 hover:border-gray-400 bg-transparent"
                    >
                      <Home className="h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Link href="/customer/profile/orders">
                    <Button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800">
                      View Order History
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Dialog open={showDriverInfo} onOpenChange={setShowDriverInfo}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <div className="bg-gray-900 p-2 rounded-full">
                <Car className="h-5 w-5 text-white" />
              </div>
              Your Driver is on the way
            </DialogTitle>
          </DialogHeader>
          {order.driverProfile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-2 border-gray-200">
                  <AvatarImage src={order.driverProfile.user?.image || ""} />
                  <AvatarFallback className="bg-gray-900 text-white text-xl">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl text-gray-900">{order.driverProfile.user?.name || "Driver"}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">4.8 rating</span>
                  </div>
                  {order.driverProfile.vehicleType && (
                    <Badge className="mt-2 bg-gray-900 text-white border-0">{order.driverProfile.vehicleType}</Badge>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Vehicle Details</p>
                    <p className="text-gray-700 font-medium">
                      {order.driverProfile.vehicleMake || "Vehicle"} {order.driverProfile.vehicleModel || ""}
                    </p>
                    <p className="text-gray-600 font-mono text-sm">{order.driverProfile.vehiclePlate || "N/A"}</p>
                  </div>
                  {order.driverProfile.phoneNumber && (
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Driver
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowDriverInfo(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-lg font-medium rounded-lg"
              >
                Continue Tracking
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
          <div className="flex items-center gap-4">
            <RefreshButton onRefresh={handleManualRefresh} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <LiveTracking
              orderStatus={order.status}
              driverLocation={driverLocation}
              restaurantLocation={{
                lat: order.restaurant.mapLatitude ?? 0,
                lng: order.restaurant.mapLongitude ?? 0,
              }}
              customerAddress={order.deliveryAddress}
            />
          </div>
          <div className="xl:col-span-1 space-y-6">
            <Card className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-900 text-white">
                <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
                <p className="text-gray-300">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      <span className="flex-1 pr-2 text-gray-700 font-medium">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold mr-2">
                          {item.quantity}×
                        </span>
                        {item.menuItem.name}
                      </span>
                      <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <p>Subtotal</p>
                      <p className="font-medium">${order.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <p>Delivery Fee</p>
                      <p className="font-medium">${order.deliveryFee.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <p>Service Fee</p>
                      <p className="font-medium">${order.serviceFee.toFixed(2)}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-semibold text-xl">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-2 text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Delivery Address
                    </h3>
                    <p className="text-gray-700 font-medium">{order.deliveryAddress}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-2 text-gray-900 flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Restaurant
                    </h3>
                    <p className="text-gray-700 font-medium">{order.restaurant.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
