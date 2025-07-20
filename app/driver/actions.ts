"use server"

import { revalidatePath } from "next/cache"
import { getDriverProfileIdFromSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { emitSocketEvent } from "@/lib/socket-server"

export async function getDriverDashboardData() {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    throw new Error("Driver not authenticated")
  }

  const driver = await prisma.driverProfile.findUnique({
    where: { id: driverProfileId },
  })

  // Find the driver's current active order
  const activeOrder = await prisma.order.findFirst({
    where: {
      driverProfileId,
      status: { in: ["OUT_FOR_DELIVERY"] },
    },
    include: { restaurant: true, customerProfile: { include: { user: true } } },
  })

  // Find orders that are ready for pickup and not yet assigned to any driver
  const availableOrders = await prisma.order.findMany({
    where: {
      status: "READY_FOR_PICKUP",
      driverProfileId: null,
    },
    include: { restaurant: true },
    orderBy: { createdAt: "asc" },
  })

  return { driver, activeOrder, availableOrders }
}

export async function toggleAvailability(isAvailable: boolean) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    return { success: false, error: "Authentication failed." }
  }

  await prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: { isAvailable },
  })

  revalidatePath("/driver/dashboard")
  return { success: true, isAvailable }
}

export async function acceptOrder(orderId: string) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    return { success: false, error: "Authentication failed." }
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId, driverProfileId: null }, // Ensure we don't snatch an already taken order
      data: {
        driverProfileId,
        status: "OUT_FOR_DELIVERY",
      },
      include: {
        customerProfile: true,
      },
    })

    // Notify customer that their order is on the way
    const customerRoom = `user-${updatedOrder.customerProfile.userId}`
    await emitSocketEvent(customerRoom, "order_notification", {
      orderId: updatedOrder.id,
      status: "OUT_FOR_DELIVERY",
      message: "Your driver is on the way!",
    })
    // Also notify all drivers so the order is removed from their available list
    await emitSocketEvent("drivers", "order_accepted", { orderId: updatedOrder.id })

    revalidatePath("/driver/dashboard")
    return { success: true, order: updatedOrder }
  } catch (error) {
    console.error("Failed to accept order:", error)
    return { success: false, error: "Order may have already been taken." }
  }
}

export async function updateDriverLocation(latitude: number, longitude: number) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) return

  const driver = await prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: { latitude, longitude },
  })

  const activeOrder = await prisma.order.findFirst({
    where: {
      driverProfileId: driver.id,
      status: "OUT_FOR_DELIVERY",
    },
    select: { id: true, customerProfile: { select: { userId: true } } },
  })

  if (activeOrder) {
    const customerRoom = `user-${activeOrder.customerProfile.userId}`
    await emitSocketEvent(customerRoom, "driver_location_update", {
      orderId: activeOrder.id,
      lat: latitude,
      lng: longitude,
    })
  }
}

export async function completeDelivery(orderId: string) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) {
    return { success: false, error: "Authentication failed." }
  }
  const order = await prisma.order.findFirst({
    where: { id: orderId, driverProfileId },
    include: { customerProfile: true },
  })

  if (!order) {
    return { success: false, error: "Order not found." }
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: "DELIVERED" },
  })

  const customerRoom = `user-${order.customerProfile.userId}`
  await emitSocketEvent(customerRoom, "order_notification", {
    orderId: updatedOrder.id,
    status: "DELIVERED",
    message: "Your order has been delivered! Enjoy your meal.",
  })

  revalidatePath("/driver/dashboard")
  return { success: true }
}
