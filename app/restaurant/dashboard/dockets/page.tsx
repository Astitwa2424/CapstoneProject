"use client"

import { useState, useEffect } from "react"
import { OrderDockets } from "@/components/restaurant/order-dockets"
import { getActiveOrders } from "@/app/restaurant/actions/dockets"

interface OrderItem {
  id: string
  quantity: number
  price: number
  specialInstructions?: string
  menuItem: {
    id: string
    name: string
    description?: string
  }
}

interface Order {
  id: string
  status: string
  total: number
  subtotal: number
  deliveryFee: number
  serviceFee: number
  deliveryAddress: string
  specialInstructions?: string
  createdAt: string
  orderItems: OrderItem[]
  customerProfile: {
    user: {
      name: string
      email: string
    }
  }
}

export default function DocketsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const activeOrders = await getActiveOrders()
        setOrders(activeOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()

    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading kitchen dockets...</p>
        </div>
      </div>
    )
  }

  return <OrderDockets orders={orders} />
}
