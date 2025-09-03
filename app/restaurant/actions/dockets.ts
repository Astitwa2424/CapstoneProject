"use server"

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

export async function getActiveOrders(): Promise<Order[]> {
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

    return orders as Order[]
  } catch (error) {
    console.error("Error fetching active orders:", error)
    return []
  }
}
