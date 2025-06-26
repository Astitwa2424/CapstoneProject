"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, User, DollarSign, CheckCircle, AlertCircle, Truck } from "lucide-react"
import { toast } from "sonner"

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

// Mock data - replace with real data from your API
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customerName: "John Smith",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Main St, Sydney NSW 2000",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 18.5 },
      { name: "Caesar Salad", quantity: 1, price: 12.0 },
      { name: "Garlic Bread", quantity: 2, price: 6.5 },
    ],
    total: 37.0,
    status: "new",
    orderTime: "2024-01-15T14:30:00Z",
    estimatedTime: 25,
    paymentMethod: "Card",
    deliveryType: "delivery",
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customerName: "Sarah Johnson",
    customerPhone: "+1 (555) 987-6543",
    customerAddress: "456 Oak Ave, Sydney NSW 2001",
    items: [
      { name: "Chicken Burger", quantity: 2, price: 15.0 },
      { name: "Sweet Potato Fries", quantity: 1, price: 8.5 },
    ],
    total: 38.5,
    status: "preparing",
    orderTime: "2024-01-15T14:15:00Z",
    estimatedTime: 20,
    paymentMethod: "Cash",
    deliveryType: "pickup",
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customerName: "Mike Wilson",
    customerPhone: "+1 (555) 456-7890",
    customerAddress: "789 Pine St, Sydney NSW 2002",
    items: [
      { name: "Fish & Chips", quantity: 1, price: 16.5 },
      { name: "Mushy Peas", quantity: 1, price: 4.5 },
      { name: "Tartar Sauce", quantity: 1, price: 2.0 },
    ],
    total: 23.0,
    status: "ready",
    orderTime: "2024-01-15T14:00:00Z",
    estimatedTime: 15,
    paymentMethod: "Card",
    deliveryType: "delivery",
  },
]

const statusConfig = {
  new: { color: "bg-blue-100 text-blue-800", label: "New Order", icon: AlertCircle },
  accepted: { color: "bg-yellow-100 text-yellow-800", label: "Accepted", icon: CheckCircle },
  preparing: { color: "bg-orange-100 text-orange-800", label: "Preparing", icon: Clock },
  ready: { color: "bg-green-100 text-green-800", label: "Ready", icon: CheckCircle },
  out_for_delivery: { color: "bg-purple-100 text-purple-800", label: "Out for Delivery", icon: Truck },
  delivered: { color: "bg-gray-100 text-gray-800", label: "Delivered", icon: CheckCircle },
}

export function LiveOrdersBoard() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [currentTime, setCurrentTime] = useState(new Date())

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
            <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, "delivered")}>
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
            <p className="text-gray-500">All orders have been completed. New orders will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon
            const timeElapsed = getTimeElapsed(order.orderTime)
            const isOverdue = timeElapsed > order.estimatedTime

            return (
              <Card key={order.id} className={`${isOverdue ? "border-red-200 bg-red-50" : ""}`}>
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
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{order.customerPhone}</span>
                    </div>
                    {order.deliveryType === "delivery" && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <span className="text-sm">{order.customerAddress}</span>
                      </div>
                    )}
                    {order.deliveryType === "pickup" && (
                      <Badge variant="outline" className="w-fit">
                        Pickup Order
                      </Badge>
                    )}
                  </div>

                  {/* Order Items */}
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

                  {/* Payment Method */}
                  <div className="flex items-center justify-between text-sm">
                    <span>Payment:</span>
                    <Badge variant="outline">{order.paymentMethod}</Badge>
                  </div>

                  {/* Actions */}
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
