"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, DollarSign, CheckCircle, AlertCircle, Truck } from "lucide-react"
import { toast } from "sonner"
import { getSocket } from "@/lib/socket"
import { useSession } from "next-auth/react"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: Array<{
    name: string
    quantity: number
    price: number
    specialInstructions?: string
  }>
  total: number
  status: "new" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "delivered"
  orderTime: string
  estimatedTime: number
  paymentMethod: string
  deliveryType: "delivery" | "pickup"
}

const statusConfig = {
  new: { color: "bg-blue-100 text-blue-800", label: "New Order", icon: AlertCircle },
  accepted: { color: "bg-yellow-100 text-yellow-800", label: "Accepted", icon: CheckCircle },
  preparing: { color: "bg-orange-100 text-orange-800", label: "Preparing", icon: Clock },
  ready: { color: "bg-green-100 text-green-800", label: "Ready", icon: CheckCircle },
  out_for_delivery: { color: "bg-purple-100 text-purple-800", label: "Out for Delivery", icon: Truck },
  delivered: { color: "bg-gray-100 text-gray-800", label: "Delivered", icon: CheckCircle },
}

// We need a way to get the restaurant ID on the client
async function getRestaurantIdForCurrentUser(userId: string) {
  // This is a placeholder for an API call or a server action
  // In a real app, you'd fetch this securely
  console.log("Fetching restaurant ID for user:", userId)
  return "clzof8z5w0001r9vwhqg1h1z2" // Replace with actual logic
}

export function LiveOrdersBoard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const { data: session } = useSession()
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      // In a real app, you'd fetch this from an API endpoint
      const fetchRestaurantId = async () => {
        const profile = await fetch("/api/restaurant/profile-id").then((res) => res.json())
        if (profile.id) {
          setRestaurantId(profile.id)
        }
      }
      fetchRestaurantId()
    }
  }, [session])

  useEffect(() => {
    if (!restaurantId) return

    const socket = getSocket()

    socket.emit("join_restaurant_room", restaurantId)

    const handleNewOrder = (newOrder: Order) => {
      console.log("Received new order:", newOrder)
      setOrders((prevOrders) => [newOrder, ...prevOrders])
      toast.success(`New Order #${newOrder.orderNumber} received!`)
      // Play a notification sound
      new Audio("/notification.mp3").play()
    }

    socket.on("new_order", handleNewOrder)

    return () => {
      socket.off("new_order", handleNewOrder)
    }
  }, [restaurantId])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    toast.success(
      `Order ${orders.find((o) => o.id === orderId)?.orderNumber} updated to ${statusConfig[newStatus].label}`,
    )
  }

  const getTimeElapsed = (orderTime: string) => {
    const elapsed = Math.floor((currentTime.getTime() - new Date(orderTime).getTime()) / 1000 / 60)
    return elapsed
  }

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case "new":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, "accepted")}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setOrders(orders.filter((o) => o.id !== order.id))}>
              Reject
            </Button>
          </div>
        )
      case "accepted":
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "preparing")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Start Preparing
          </Button>
        )
      case "preparing":
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "ready")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Mark Ready
          </Button>
        )
      case "ready":
        return order.deliveryType === "delivery" ? (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Send for Delivery
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "delivered")}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark Collected
          </Button>
        )
      case "out_for_delivery":
        return (
          <Button
            size="sm"
            onClick={() => updateOrderStatus(order.id, "delivered")}
            className="bg-green-600 hover:bg-green-700"
          >
            Mark Delivered
          </Button>
        )
      default:
        return null
    }
  }

  const activeOrders = orders.filter((order) => order.status !== "delivered")

  return (
    <div className="space-y-4">
      {activeOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-gray-500">Waiting for new orders... They will appear here in real-time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon
            const timeElapsed = getTimeElapsed(order.orderTime)
            const isOverdue = timeElapsed > order.estimatedTime

            return (
              <Card
                key={order.id}
                className={`${isOverdue ? "border-red-200 bg-red-50" : ""} ${order.status === "new" ? "animate-pulse-fast border-blue-500" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <Badge className={statusConfig[order.status].color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[order.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                      <Clock className="w-4 h-4" />
                      {timeElapsed}m elapsed
                      {isOverdue && " (OVERDUE)"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />${order.total.toFixed(2)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">{getStatusActions(order)}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
