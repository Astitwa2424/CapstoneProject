"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getOrderDetails } from "@/app/customer/actions"
import LiveTracking from "@/components/tracking/live-tracking"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2 } from "lucide-react"
import type { Order, OrderItem, RestaurantProfile, CustomerProfile, User } from "@prisma/client"

type FullOrderItem = OrderItem & { menuItem: { name: string } }
type FullOrder = Order & {
  orderItems: FullOrderItem[]
  restaurant: RestaurantProfile
  customerProfile: CustomerProfile & { user: User }
}

export default function TrackOrderPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<FullOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return

    async function fetchOrder() {
      try {
        setLoading(true)
        const orderDetails = (await getOrderDetails(orderId)) as FullOrder | null
        if (orderDetails) {
          setOrder(orderDetails)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!order) {
    return null // Should be covered by error state
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <LiveTracking orderStatus={order.status} />
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 pr-2">
                      {item.quantity} x {item.menuItem.name}
                    </span>
                    <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <p>Subtotal</p>
                  <p className="font-mono">${order.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p>Delivery Fee</p>
                  <p className="font-mono">${order.deliveryFee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p>Service Fee</p>
                  <p className="font-mono">${order.serviceFee.toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p className="font-mono">${order.total.toFixed(2)}</p>
                </div>
              </div>
              <Separator className="my-6" />
              <div>
                <h3 className="font-semibold mb-2">Delivery to:</h3>
                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Restaurant:</h3>
                <p className="text-sm text-muted-foreground">{order.restaurant.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
