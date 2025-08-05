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
      return
    }

    const handleOrderStatusUpdate = (data: { orderId: string; status: OrderStatus }) => {
      if (data.orderId === order.id) {
        setOrder((prevOrder) => (prevOrder ? { ...prevOrder, status: data.status } : null))
      }
    }

    const handleDriverLocationUpdate = (data: { orderId: string; lat: number; lng: number }) => {
      if (data.orderId === order.id) {
        setDriverLocation({ lat: data.lat, lng: data.lng })
      }
    }

    const room = `order_${order.id}`
    socket.emit("join-room", room)

    socket.on("order_notification", handleOrderStatusUpdate)
    socket.on("driver_location_update", handleDriverLocationUpdate)

    return () => {
      socket.off("order_notification", handleOrderStatusUpdate)
      socket.off("driver_location_update", handleDriverLocationUpdate)
      socket.emit("leave-room", room)
    }
  }, [order, socket, isConnected])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-orange-200 rounded-full mx-auto"></div>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Loading your order...</h2>
          <p className="text-gray-600">Getting the latest updates</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col items-center justify-center text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/customer/dashboard">
            <Button className="bg-red-500 hover:bg-red-600">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="bg-white shadow-2xl border-0 rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Order Delivered!</CardTitle>
              <p className="text-green-100 text-lg">Your delicious meal from {order.restaurant.name} has arrived!</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
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
                  <div className="flex justify-between font-bold text-xl text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Link href="/customer/dashboard">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 bg-transparent"
                    >
                      <Home className="h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Link href="/customer/profile/orders">
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Dialog open={showDriverInfo} onOpenChange={setShowDriverInfo}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                <Car className="h-5 w-5 text-white" />
              </div>
              Your Driver is on the way!
            </DialogTitle>
          </DialogHeader>
          {order.driverProfile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-4 border-blue-200">
                  <AvatarImage src={order.driverProfile.user?.image || ""} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800">{order.driverProfile.user?.name || "Driver"}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">4.8 rating</span>
                  </div>
                  {order.driverProfile.vehicleType && (
                    <Badge className="mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      {order.driverProfile.vehicleType}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-blue-900 text-lg">Vehicle Details</p>
                    <p className="text-blue-800 font-medium">
                      {order.driverProfile.vehicleMake || "Vehicle"} {order.driverProfile.vehicleModel || ""}
                    </p>
                    <p className="text-blue-700 font-mono text-sm">{order.driverProfile.vehiclePlate || "N/A"}</p>
                  </div>
                  {order.driverProfile.phoneNumber && (
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Driver
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowDriverInfo(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 text-lg font-semibold rounded-xl"
              >
                Continue Tracking
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Changed grid layout to make map bigger */}
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
            <Card className="bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
                <p className="text-orange-100">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      <span className="flex-1 pr-2 text-gray-700 font-medium">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold mr-2">
                          {item.quantity}×
                        </span>
                        {item.menuItem.name}
                      </span>
                      <span className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <p>Subtotal</p>
                      <p className="font-semibold">${order.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <p>Delivery Fee</p>
                      <p className="font-semibold">${order.deliveryFee.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <p>Service Fee</p>
                      <p className="font-semibold">${order.serviceFee.toFixed(2)}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-xl">
                    <span className="text-gray-800">Total</span>
                    <span className="text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h3 className="font-bold mb-2 text-blue-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Delivery Address
                    </h3>
                    <p className="text-blue-800 font-medium">{order.deliveryAddress}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <h3 className="font-bold mb-2 text-orange-900 flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Restaurant
                    </h3>
                    <p className="text-orange-800 font-medium">{order.restaurant.name}</p>
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
