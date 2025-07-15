"use client"

import { useState, useEffect } from "react"
import { OrderDockets } from "@/components/restaurant/order-dockets"
import { prisma } from "@/lib/prisma"
import { getRestaurantProfile } from "@/lib/auth-utils"

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

async function getActiveOrders() {
  "use server"

  try {
    const restaurantProfile = await getRestaurantProfile()
    if (!restaurantProfile) {
      return []
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurantProfile.id,
        status: {
          in: ["NEW", "CONFIRMED", "PREPARING", "READY"],
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        customerProfile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return orders
  } catch (error) {
    console.error("Error fetching active orders:", error)
    return []
  }
}

export default function DocketsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const activeOrders = await getActiveOrders()
        setOrders(activeOrders as Order[])
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
