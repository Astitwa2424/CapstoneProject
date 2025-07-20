"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User } from "lucide-react"
import { getSocket } from "@/lib/socket"
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

  useEffect(() => {
    const socket = getSocket()

    socket.emit("join-restaurant-room", restaurantId)

    socket.on("order_status_update", (updatedOrder: Order) => {
      setOrders((prevOrders) => {
        const orderIndex = prevOrders.findIndex((order) => order.id === updatedOrder.id)
        if (orderIndex !== -1) {
          const newOrders = [...prevOrders]
          newOrders[orderIndex] = updatedOrder
          return newOrders
        }
        return prevOrders
      })
    })

    socket.on("new_order", (newOrder: Order) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders])
      toast.success(`New order received: ${newOrder.orderNumber}`)
    })

    return () => {
      socket.off("order_status_update")
      socket.off("new_order")
    }
  }, [restaurantId])

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setProcessingOrders((prev) => new Set(prev).add(orderId))

    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, newStatus)
        if (result.success) {
          toast.success(`Order status updated to ${newStatus.toLowerCase()}`)
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
        return "bg-yellow-100 text-yellow-800"
      case "NEW":
        return "bg-blue-100 text-blue-800"
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "PREPARING":
        return "bg-orange-100 text-orange-800"
      case "READY_FOR_PICKUP":
        return "bg-purple-100 text-purple-800"
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionButtons = (order: Order) => {
    const isProcessing = processingOrders.has(order.id)

    switch (order.status) {
      case "PENDING":
      case "NEW":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(order.id, "ACCEPTED")}
              disabled={isProcessing || isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Accept Order"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
              disabled={isProcessing || isPending}
            >
              {isProcessing ? "Processing..." : "Reject"}
            </Button>
          </div>
        )
      case "ACCEPTED":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(order.id, "PREPARING")}
            disabled={isProcessing || isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isProcessing ? "Processing..." : "Start Preparing"}
          </Button>
        )
      case "PREPARING":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(order.id, "READY_FOR_PICKUP")}
            disabled={isProcessing || isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? "Processing..." : "Ready for Pickup"}
          </Button>
        )
      case "READY_FOR_PICKUP":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(order.id, "OUT_FOR_DELIVERY")}
            disabled={isProcessing || isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isProcessing ? "Processing..." : "Out for Delivery"}
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active orders at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
              <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Ordered at {formatTime(order.orderTime)}</span>
            </div>
            {order.deliveryType === "delivery" && order.deliveryAddress && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{order.deliveryAddress}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center font-semibold border-t pt-2">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="mt-4">{getActionButtons(order)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
