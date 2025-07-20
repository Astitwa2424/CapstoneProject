"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, CreditCard, FileText } from "lucide-react"
import { getOrderDetails } from "@/app/customer/actions"
import { useEffect } from "react"

interface OrderDetailsDialogProps {
  orderId: string
  children: React.ReactNode
}

export function OrderDetailsDialog({ orderId, children }: OrderDetailsDialogProps) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && !order) {
      setLoading(true)
      getOrderDetails(orderId).then((orderData) => {
        setOrder(orderData)
        setLoading(false)
      })
    }
  }, [open, orderId, order])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "on_the_way":
        return "bg-blue-100 text-blue-800"
      case "new":
        return "bg-purple-100 text-purple-800"
      case "accepted":
        return "bg-orange-100 text-orange-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{order.restaurant.name}</h3>
                <p className="text-sm text-gray-600">Order #{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <Badge className={getStatusColor(order.status)}>{formatStatus(order.status)}</Badge>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span>Payment: {order.paymentStatus || "Paid"}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Delivery Address</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">{order.deliveryAddress}</p>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Special Instructions</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">{order.specialInstructions}</p>
              </div>
            )}

            <Separator />

            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-3">Order Items</h4>
              <div className="space-y-3">
                {order.orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span>{item.menuItem.name}</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 mt-1 ml-6">Note: {item.specialInstructions}</p>
                      )}
                      {item.selectedModifications && Object.keys(item.selectedModifications).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1 ml-6">
                          Modifications:{" "}
                          {Object.entries(item.selectedModifications)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>${order.serviceFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Order not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
