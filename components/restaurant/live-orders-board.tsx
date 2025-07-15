"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, User, ChefHat, CheckCircle, XCircle } from "lucide-react"
import { io } from "socket.io-client"
import { toast } from "sonner"
import { updateOrderStatus } from "@/app/restaurant/actions"
import type { OrderStatus } from "@prisma/client"

export interface LiveOrder {
  id: string
  orderNumber: string
  customerName: string
  items: Array<{
    name: string
    quantity: number
    price: number
    modifications?: Array<{ label: string; cost: number }>
  }>
  total: number
  status: OrderStatus
  orderTime: string
  estimatedTime: number
  deliveryType: "delivery" | "pickup"
  deliveryAddress?: string | null
}

interface LiveOrdersBoardProps {
  restaurantId: string
  initialOrders: LiveOrder[]
}

export function LiveOrdersBoard({ restaurantId, initialOrders }: LiveOrdersBoardProps) {
  const [orders, setOrders] = useState<LiveOrder[]>(initialOrders)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setOrders(initialOrders)

    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      path: "/api/socket.io",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id)
      setIsConnected(true)
      socketInstance.emit("join-restaurant-room", restaurantId)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
      toast.error("Failed to connect to live order service.")
    })

    socketInstance.on("new_order", (newOrderData) => {
      console.log("Received new order via socket:", newOrderData)
      const newOrder: LiveOrder = newOrderData.order

      setOrders((prevOrders) => {
        if (prevOrders.some((order) => order.id === newOrder.id)) {
          return prevOrders
        }
        toast.success(`New Order #${newOrder.orderNumber} from ${newOrder.customerName}!`)
        return [newOrder, ...prevOrders]
      })
    })

    socketInstance.on("order_status_update", (updatedOrder: LiveOrder) => {
      console.log("Received order status update:", updatedOrder)
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      toast.info(`Order #${updatedOrder.orderNumber} status updated to ${updatedOrder.status}`)
    })

    return () => {
      console.log("Disconnecting socket...")
      socketInstance.disconnect()
    }
  }, [restaurantId, initialOrders])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const originalOrders = [...orders]
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))

    const result = await updateOrderStatus(orderId, status)

    if (result.success) {
      toast.success(`Order status updated to ${status}`)
    } else {
      toast.error(`Failed to update order: ${result.error}`)
      setOrders(originalOrders)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-400"
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-400"
      case "PREPARING":
        return "bg-indigo-100 text-indigo-800 border-indigo-400"
      case "READY":
        return "bg-purple-100 text-purple-800 border-purple-400"
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-100 text-cyan-800 border-cyan-400"
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-400"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-400"
      default:
        return "bg-gray-100 text-gray-800 border-gray-400"
    }
  }

  const getNextAction = (status: OrderStatus): { label: string; nextStatus: OrderStatus } | null => {
    switch (status) {
      case "PENDING":
        return { label: "Accept Order", nextStatus: "ACCEPTED" }
      case "ACCEPTED":
        return { label: "Start Preparing", nextStatus: "PREPARING" }
      case "PREPARING":
        return { label: "Ready for Pickup/Delivery", nextStatus: "READY" }
      case "READY":
        return { label: "Out for Delivery", nextStatus: "OUT_FOR_DELIVERY" }
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live Orders</CardTitle>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
              <p className="text-gray-500">New orders will appear here in real-time as they are placed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => {
                const nextAction = getNextAction(order.status)
                return (
                  <Card key={order.id} className={`border-l-4 ${getStatusColor(order.status).split(" ")[2]}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2 text-base">
                          <User className="w-5 h-5" />
                          <span>{order.customerName}</span>
                        </CardTitle>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 pt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatTime(order.orderTime)}</span>
                        <span className="mx-2">|</span>
                        <span>{order.orderNumber}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Items</h4>
                        <div className="space-y-1 text-sm">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      {order.deliveryType === "delivery" && order.deliveryAddress && (
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                          <p className="text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-lg font-bold">{formatPrice(order.total)}</div>
                        <div className="flex items-center space-x-2">
                          {order.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          )}
                          {nextAction && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, nextAction.nextStatus)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {nextAction.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
