"use server"

import { auth } from "@/lib/auth"
import { getDriverProfileIdFromSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { emitSocketEvent } from "@/lib/socket-server"
import { OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getDriverProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const driverProfile = await prisma.driverProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  })

  return driverProfile
}

export async function getDriverDashboardStats() {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    return null
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [todaysDeliveries, totalDeliveries, ratings] = await Promise.all([
    prisma.order.count({
      where: {
        driverProfileId,
        status: OrderStatus.DELIVERED,
        updatedAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.order.count({
      where: {
        driverProfileId,
        status: OrderStatus.DELIVERED,
      },
    }),
    prisma.review.findMany({
      where: {
        driverProfileId,
        rating: { not: null },
      },
      select: {
        rating: true,
      },
    }),
  ])

  const totalRating = ratings.reduce((acc, r) => acc + (r.rating || 0), 0)
  const averageRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(1) : "N/A"

  const todaysEarnings = (todaysDeliveries * 5).toFixed(2) // Assuming a flat $5 delivery fee per order

  return {
    todaysEarnings,
    completedDeliveries: totalDeliveries,
    averageRating,
    activeHours: "N/A", // Placeholder
  }
}

export async function getAvailableOrders() {
  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.READY_FOR_PICKUP,
      driverProfileId: null, // Only fetch orders that don't have a driver yet
    },
    include: {
      restaurant: {
        include: {
          user: true,
        },
      },
      customerProfile: true,
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  return orders
}

export async function acceptOrder(orderId: string) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    throw new Error("Driver not found")
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      driverProfileId: driverProfileId,
      status: OrderStatus.OUT_FOR_DELIVERY,
    },
  })

  // Notify customer and restaurant
  emitSocketEvent(order.customerProfileId, "order-update", order)
  emitSocketEvent(order.restaurantId, "order-update", order)

  revalidatePath("/driver/dashboard")
  revalidatePath(`/customer/order/${orderId}/track`)
}

export async function updateDriverLocation(lat: number, lng: number) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    return
  }

  await prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: {
      latitude: lat,
      longitude: lng,
    },
  })

  // Find active order to notify customer
  const activeOrder = await prisma.order.findFirst({
    where: {
      driverProfileId,
      status: OrderStatus.OUT_FOR_DELIVERY,
    },
  })

  if (activeOrder) {
    emitSocketEvent(activeOrder.customerProfileId, "driver-location-update", {
      orderId: activeOrder.id,
      lat,
      lng,
    })
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    throw new Error("Driver not found")
  }

  const order = await prisma.order.update({
    where: { id: orderId, driverProfileId },
    data: {
      status,
    },
  })

  // Notify customer and restaurant
  emitSocketEvent(order.customerProfileId, "order-update", order)
  emitSocketEvent(order.restaurantId, "order-update", order)

  revalidatePath("/driver/dashboard")
  revalidatePath(`/customer/order/${orderId}/track`)
}

export async function toggleDriverAvailability() {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    throw new Error("Driver not found")
  }

  const driverProfile = await prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  })

  if (!driverProfile) {
    throw new Error("Driver profile not found")
  }

  const updatedProfile = await prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: {
      isAvailable: !driverProfile.isAvailable,
    },
  })

  revalidatePath("/driver/dashboard")
  return updatedProfile.isAvailable
}
