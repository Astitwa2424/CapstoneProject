"use client"

import { useState, useEffect, useTransition } from "react"
import {
  getDriverDashboardData,
  toggleAvailability,
  acceptOrder,
  completeDelivery,
  updateDriverLocation,
} from "@/app/driver/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin, Navigation, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { getSocket } from "@/lib/socket"
import type { Order, RestaurantProfile, DriverProfile, CustomerProfile, User } from "@prisma/client"

type FullOrder = Order & { restaurant: RestaurantProfile; customerProfile: CustomerProfile & { user: User } }
type AvailableOrder = Order & { restaurant: RestaurantProfile }

export default function DriverDashboard() {
  const [driver, setDriver] = useState<DriverProfile | null>(null)
  const [activeOrder, setActiveOrder] = useState<FullOrder | null>(null)
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [locationError, setLocationError] = useState<string | null>(null)

  const isAvailable = driver?.isAvailable ?? false

  const fetchData = async () => {
    try {
      const data = await getDriverDashboardData()
      setDriver(data.driver)
      setActiveOrder(data.activeOrder as FullOrder | null)
      setAvailableOrders(data.availableOrders as AvailableOrder[])
    } catch (error) {
      toast.error("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Real-time updates for new available orders
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.emit("join_room", "drivers")

    const handleNewOrder = (newOrder: AvailableOrder) => {
      setAvailableOrders((prev) => [newOrder, ...prev])
      toast.info(`New delivery available from ${newOrder.restaurant.name}!`)
    }

    const handleOrderAccepted = (data: { orderId: string }) => {
      setAvailableOrders((prev) => prev.filter((o) => o.id !== data.orderId))
    }

    socket.on("new_order_for_drivers", handleNewOrder)
    socket.on("order_accepted", handleOrderAccepted)

    return () => {
      socket.off("new_order_for_drivers", handleNewOrder)
      socket.off("order_accepted", handleOrderAccepted)
      socket.emit("leave_room", "drivers")
    }
  }, [])

  // Real-time location tracking
  useEffect(() => {
    let watchId: number | null = null

    if (isAvailable && activeOrder) {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser.")
        return
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Send location to server without blocking UI
          updateDriverLocation(latitude, longitude)
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationError(`Location Error: ${error.message}`)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [isAvailable, activeOrder])

  const handleToggleAvailability = async (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleAvailability(checked)
      if (result.success) {
        setDriver((prev) => (prev ? { ...prev, isAvailable: result.isAvailable } : null))
        toast.success(`You are now ${result.isAvailable ? "online" : "offline"}.`)
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleAcceptOrder = async (orderId: string) => {
    startTransition(async () => {
      const result = await acceptOrder(orderId)
      if (result.success) {
        toast.success("Order accepted! Time to get moving.")
        await fetchData() // Refresh all data
      } else {
        toast.error(result.error)
        // Another driver might have taken it, so refresh available orders
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId))
      }
    })
  }

  const handleCompleteDelivery = async (orderId: string) => {
    startTransition(async () => {
      const result = await completeDelivery(orderId)
      if (result.success) {
        toast.success("Delivery completed! Great job.")
        setActiveOrder(null)
        await fetchData() // Refresh all data
      } else {
        toast.error(result.error)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Switch
            id="availability-toggle"
            checked={isAvailable}
            onCheckedChange={handleToggleAvailability}
            disabled={isPending}
          />
          <Label
            htmlFor="availability-toggle"
            className={`font-semibold ${isAvailable ? "text-green-600" : "text-red-600"}`}
          >
            {isPending ? "Updating..." : isAvailable ? "Online" : "Offline"}
          </Label>
        </div>
      </header>

      {locationError && <p className="text-red-500 text-center mb-4">{locationError}</p>}

      {activeOrder ? (
        <ActiveOrderCard order={activeOrder} onComplete={handleCompleteDelivery} isPending={isPending} />
      ) : isAvailable ? (
        <AvailableOrdersList orders={availableOrders} onAccept={handleAcceptOrder} isPending={isPending} />
      ) : (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>You are Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Go online to see available deliveries.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ActiveOrderCard({
  order,
  onComplete,
  isPending,
}: { order: FullOrder; onComplete: (id: string) => void; isPending: boolean }) {
  const pickupAddress = `${order.restaurant.address}, ${order.restaurant.city}`
  const deliveryAddress = order.deliveryAddress

  const openInGoogleMaps = (address: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, "_blank")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Active Delivery</CardTitle>
        <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" /> Pickup From
          </h3>
          <p className="font-bold">{order.restaurant.name}</p>
          <p className="text-muted-foreground">{pickupAddress}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-transparent"
            onClick={() => openInGoogleMaps(pickupAddress)}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate to Pickup
          </Button>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Deliver To
          </h3>
          <p className="font-bold">{order.customerProfile.user.name}</p>
          <p className="text-muted-foreground">{deliveryAddress}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-transparent"
            onClick={() => openInGoogleMaps(deliveryAddress)}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navigate to Delivery
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onComplete(order.id)} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Mark as Delivered
        </Button>
      </CardFooter>
    </Card>
  )
}

function AvailableOrdersList({
  orders,
  onAccept,
  isPending,
}: { orders: AvailableOrder[]; onAccept: (id: string) => void; isPending: boolean }) {
  if (orders.length === 0) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>No Available Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Waiting for new deliveries. You'll be notified!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Available for Pickup</h2>
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <CardTitle>{order.restaurant.name}</CardTitle>
            <CardDescription>
              {order.restaurant.address}, {order.restaurant.city}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Delivery to: {order.deliveryAddress.split(",")[0]}</p>
            <p className="text-muted-foreground">Order Total: ${order.total.toFixed(2)}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => onAccept(order.id)} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Accept Delivery
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
