"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"
import { emitSocketEvent, emitToRestaurant } from "@/lib/socket-server"
import { auth } from "@/lib/auth"
import { getDriverProfileIdFromSession } from "@/lib/auth-utils"

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          format: "json",
          q: address,
          countrycodes: "au",
          limit: "1",
        }),
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) }
    }
    return null
  } catch (error) {
    console.error("Geocoding failed:", error)
    return null
  }
}

export async function getDriverProfile() {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.driverProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  })
}

export async function getDriverDashboardStats() {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId)
    return {
      todaysEarnings: "0.00",
      completedDeliveries: 0,
      averageRating: "N/A",
      activeHours: "0h",
    }
  try {
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
    const [todaysDeliveries, totalDeliveries, ratings] = await Promise.all([
      prisma.order.count({ where: { driverProfileId, status: "DELIVERED", updatedAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { driverProfileId, status: "DELIVERED" } }),
      prisma.review.findMany({ where: { driverProfileId, rating: { not: null } }, select: { rating: true } }),
    ])
    const avgRating =
      ratings.length > 0 ? (ratings.reduce((acc, r) => acc + (r.rating || 0), 0) / ratings.length).toFixed(1) : "N/A"
    return {
      todaysEarnings: (todaysDeliveries * 5).toFixed(2),
      completedDeliveries: totalDeliveries,
      averageRating: avgRating,
      activeHours: "N/A",
    }
  } catch (error) {
    console.error("Error fetching driver stats:", error)
    return {
      todaysEarnings: "0.00",
      completedDeliveries: 0,
      averageRating: "N/A",
      activeHours: "0h",
    }
  }
}

export async function toggleDriverAvailability(): Promise<boolean> {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) throw new Error("Driver profile not found.")

  const driver = await prisma.driverProfile.findUnique({ where: { id: driverProfileId } })
  if (!driver) throw new Error("Driver not found.")

  const updatedDriver = await prisma.driverProfile.update({
    where: { id: driverProfileId },
    data: { isAvailable: !driver.isAvailable },
  })

  revalidatePath("/driver/dashboard")
  return updatedDriver.isAvailable
}

export async function updateDriverLocation(lat: number, lng: number) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) return { success: false, error: "Driver not found" }

  try {
    const driverProfile = await prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: { latitude: lat, longitude: lng },
    })

    const activeOrder = await prisma.order.findFirst({
      where: {
        driverProfileId: driverProfile.id,
        status: OrderStatus.OUT_FOR_DELIVERY,
      },
      select: { id: true, customerProfile: { select: { userId: true } }, restaurant: true },
    })

    if (activeOrder) {
      if (activeOrder.customerProfile?.userId) {
        await emitSocketEvent(`user_${activeOrder.customerProfile.userId}`, "driver_location_update", {
          orderId: activeOrder.id,
          lat,
          lng,
        })
      }

      await emitToRestaurant(activeOrder.restaurant.id, "driver_location_update", {
        orderId: activeOrder.id,
        lat,
        lng,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to update driver location:", error)
    return { success: false, error: "Database error." }
  }
}

export async function acceptOrder(orderId: string) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) throw new Error("Driver profile not found.")

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.driverProfileId) {
    throw new Error("Order not available or already taken.")
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      driverProfileId,
      status: OrderStatus.OUT_FOR_DELIVERY,
    },
    include: {
      driverProfile: true,
      customerProfile: { include: { user: true } },
      restaurant: true,
    },
  })

  const deliveryCoords = await geocodeAddress(updatedOrder.deliveryAddress)

  if (updatedOrder.customerProfile?.userId) {
    await emitSocketEvent(`user_${updatedOrder.customerProfile.userId}`, "order_notification", {
      orderId: updatedOrder.id,
      status: OrderStatus.OUT_FOR_DELIVERY,
      title: "Your driver is on the way!",
      message: `Your order from ${updatedOrder.restaurant.name} has been picked up.`,
    })
  }

  if (updatedOrder.driverProfile?.latitude && updatedOrder.driverProfile?.longitude) {
    await emitSocketEvent(`order_${orderId}`, "driver_location_update", {
      orderId: orderId,
      lat: updatedOrder.driverProfile.latitude,
      lng: updatedOrder.driverProfile.longitude,
    })
  }

  await emitSocketEvent("drivers", "order_accepted_by_other", orderId)
  await emitToRestaurant(updatedOrder.restaurant.id, "order_status_update", updatedOrder)

  revalidatePath("/driver/dashboard")
  revalidatePath(`/order/${orderId}/track`)

  return {
    ...updatedOrder,
    deliveryLat: deliveryCoords?.lat,
    deliveryLng: deliveryCoords?.lng,
  }
}

export async function completeDelivery(orderId: string) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) throw new Error("Driver not found")

  const updatedOrder = await prisma.order.update({
    where: { id: orderId, driverProfileId },
    data: { status: OrderStatus.DELIVERED },
    include: {
      customerProfile: { select: { userId: true } },
      restaurant: { select: { id: true } },
    },
  })

  if (updatedOrder.customerProfile.userId) {
    await emitSocketEvent(`user_${updatedOrder.customerProfile.userId}`, "order_notification", {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      title: "Order Delivered!",
      message: `Your order has been successfully delivered. Enjoy your meal!`,
    })
  }

  await emitToRestaurant(updatedOrder.restaurant.id, "order_status_update", updatedOrder)

  revalidatePath("/driver/dashboard")
  revalidatePath(`/customer/order/${orderId}/track`)

  return updatedOrder
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) throw new Error("Driver not found")

  const updatedOrder = await prisma.order.update({
    where: { id: orderId, driverProfileId },
    data: { status },
    include: {
      customerProfile: { select: { userId: true } },
      restaurant: { select: { id: true } },
    },
  })

  if (updatedOrder.customerProfile.userId) {
    await emitSocketEvent(`user_${updatedOrder.customerProfile.userId}`, "order_notification", {
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      message: `Your order status has been updated to ${status.replace(/_/g, " ").toLowerCase()}`,
    })
  }

  await emitToRestaurant(updatedOrder.restaurant.id, "order_status_update", updatedOrder)

  revalidatePath("/driver/dashboard")
  revalidatePath(`/customer/order/${orderId}/track`)
}

export async function getInitialDriverData() {
  try {
    const driver = await getDriverProfile()
    if (!driver) return { driver: null, stats: null, orders: [], activeOrder: null }

    const [stats, orders, activeOrder] = await Promise.all([
      getDriverDashboardStats(),
      driver.isAvailable
        ? prisma.order.findMany({
            where: { status: OrderStatus.READY_FOR_PICKUP, driverProfileId: null },
            include: { restaurant: true },
            orderBy: { createdAt: "desc" },
          })
        : [],
      prisma.order.findFirst({
        where: { driverProfileId: driver.id, status: OrderStatus.OUT_FOR_DELIVERY },
        include: {
          restaurant: true,
          customerProfile: { include: { user: true } },
          orderItems: { include: { menuItem: true } },
        },
      }),
    ])

    return { driver, stats, orders, activeOrder }
  } catch (error) {
    console.error("Error fetching initial driver data:", error)
    return {
      driver: null,
      stats: { todaysEarnings: "0.00", completedDeliveries: 0, averageRating: "N/A", activeHours: "0h" },
      orders: [],
      activeOrder: null,
    }
  }
}

export async function updateDriverProfile(prevState: any, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Not authenticated" }

    const driverProfileId = await getDriverProfileIdFromSession()
    if (!driverProfileId) return { error: "Driver profile not found" }

    const profileData = {
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      address: formData.get("address") as string,
      vehicleType: formData.get("vehicleType") as string,
      plateNumber: formData.get("plateNumber") as string,
      registrationNumber: formData.get("registrationNumber") as string,
      bankAccount: formData.get("bankAccount") as string,
      routingNumber: formData.get("routingNumber") as string,
      profileImage: formData.get("profileImage") as string,
      vehiclePhotos: formData.getAll("vehiclePhotos[]") as string[],
    }

    if (profileData.fullName !== session.user.name || profileData.profileImage !== session.user.image) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: profileData.fullName, image: profileData.profileImage },
      })
    }

    await prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: {
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
        address: profileData.address,
        vehicleType: profileData.vehicleType,
        plateNumber: profileData.plateNumber,
        registrationNumber: profileData.registrationNumber,
        bankAccount: profileData.bankAccount,
        routingNumber: profileData.routingNumber,
        profileImage: profileData.profileImage,
        vehiclePhotos: profileData.vehiclePhotos,
      },
    })

    revalidatePath("/driver/dashboard/account")
    return { success: true }
  } catch (e) {
    console.error("Failed to update driver profile:", e)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getDriverOrderHistory(page = 1, limit = 10, status?: OrderStatus) {
  const driverProfileId = await getDriverProfileIdFromSession()
  if (!driverProfileId) return { orders: [], totalCount: 0, totalPages: 0 }

  try {
    const where = {
      driverProfileId,
      ...(status && { status }),
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          restaurant: {
            select: { name: true, logoImage: true, address: true },
          },
          customerProfile: {
            select: { user: { select: { name: true } } },
          },
          orderItems: {
            include: { menuItem: { select: { name: true } } },
          },
          reviews: {
            where: { driverProfileId },
            select: { rating: true, comment: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error("Error fetching driver order history:", error)
    return { orders: [], totalCount: 0, totalPages: 0, currentPage: 1 }
  }
}
