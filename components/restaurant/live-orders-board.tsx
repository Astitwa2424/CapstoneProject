"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Loader2, MapPin, User, Inbox } from "lucide-react"
import { useSocket } from "@/components/providers"
import { updateOrderStatus } from "@/app/restaurant/actions"
import type { OrderStatus } from "@prisma/client"
import { toast } from "sonner"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  orderTime: string
  estimatedTime: number
  deliveryType: "delivery" | "pickup"
  deliveryAddress?: string
}

interface LiveOrdersBoardProps {
  initialOrders: Order[]
  restaurantId: string
}

export function LiveOrdersBoard({ initialOrders, restaurantId }: LiveOrdersBoardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isPending, startTransition] = useTransition()
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set())
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.emit("join-restaurant-room", restaurantId)

    const handleOrderStatusUpdate = (updatedOrder: Order) => {
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
    }

    const handleNewOrder = (newOrder: Order) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders])
      toast.success(`New order received: ${newOrder.orderNumber}`)
    }

    socket.on("order_status_update", handleOrderStatusUpdate)
    socket.on("new_order", handleNewOrder)

    return () => {
      socket.off("order_status_update", handleOrderStatusUpdate)
      socket.off("new_order", handleNewOrder)
    }
  }, [socket, restaurantId])

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrders((prev) => new Set(prev).add(orderId))

    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, newStatus)
        if (result.success) {
          toast.success(`Order status updated to ${newStatus.replace(/_/g, " ").toLowerCase()}`)
        } else {
          toast.error(result.error || "Failed to update order status")
        }
      } catch (error) {
        toast.error("Failed to update order status")
        console.error("Error updating order status:", error)
      } finally {
        setProcessingOrders((prev) => {
          const newSet = new Set(prev)
          newSet.delete(orderId)
          return newSet
        })
      }
    })
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "NEW":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200"
      case "PREPARING":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "READY_FOR_PICKUP":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getActionButtons = (order: Order) => {
    const isProcessing = processingOrders.has(order.id) || isPending

    switch (order.status) {
      case "PENDING":
      case "NEW":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(order.id, "ACCEPTED")}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
            </Button>
          </div>
        )
      case "ACCEPTED":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(order.id, "PREPARING")}
            disabled={isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Preparing"}
          </Button>
        )
      case "PREPARING":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(order.id, "READY_FOR_PICKUP")}
            disabled={isProcessing}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ready for Pickup"}
          </Button>
        )
      case "READY_FOR_PICKUP":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(order.id, "OUT_FOR_DELIVERY")}
            disabled={isProcessing}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Out for Delivery"}
          </Button>
        )
      default:
        return null
    }
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isConnected && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-lg font-medium">Connecting to real-time updates...</p>
        <p className="text-sm">Please wait a moment.</p>
      </div>
    )
  }

  if (isConnected && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Inbox className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No active orders at the moment.</p>
        <p className="text-sm">New orders will appear here automatically.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {orders.map((order) => (
        <Card key={order.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 pt-2">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Ordered at {formatTime(order.orderTime)}</span>
            </div>
            {order.deliveryType === "delivery" && order.deliveryAddress && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{order.deliveryAddress}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <div className="space-y-2 mb-4 border-t pt-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="flex-1 pr-2">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-mono">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between items-center font-semibold border-t pt-2 mb-4">
                <span>Total:</span>
                <span className="font-mono text-lg">${order.total.toFixed(2)}</span>
              </div>
              <div className="mt-auto">{getActionButtons(order)}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
