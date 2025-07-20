"use server"

import { revalidatePath } from "next/cache"
import { OrderStatus, type Modification, type MenuItem } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { emitToRestaurant, emitSocketEvent } from "@/lib/socket-server"
import { auth } from "@/lib/auth"
export type MenuItemWithModifications = MenuItem & {
  modifications: Modification[]
}

export async function getRestaurantIdFromSession(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) {
    console.error("No user session found for getting restaurant ID")
    return null
  }

  try {
    const restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })

    return restaurantProfile?.id ?? null
  } catch (error) {
    console.error("Failed to fetch restaurant profile ID:", error)
    return null
  }
}

export async function getMenuItemById(
  id: string,
): Promise<{ success: true; menuItem: MenuItemWithModifications } | { success: false; error: string }> {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    if (!restaurantId) {
      return { success: false, error: "Restaurant not found or user not authorized." }
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id, restaurantId },
      include: { modifications: true },
    })

    if (!menuItem) {
      return { success: false, error: "Menu item not found." }
    }

    return { success: true, menuItem }
  } catch (error) {
    console.error("Failed to get menu item:", error)
    return { success: false, error: "Failed to get menu item." }
  }
}

export async function createMenuItem(data: {
  name: string
  description: string
  price: number
  category: string
  allergens: string
  image: string
  spicyLevel: number
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isActive: boolean
}) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    if (!restaurantId) throw new Error("Restaurant not found or user not authorized.")

    const menuItem = await prisma.menuItem.create({
      data: { ...data, restaurantId },
    })

    await revalidatePath("/restaurant/dashboard/menu")
    return menuItem
  } catch (error) {
    console.error("Failed to create menu item:", error)
    throw new Error("Failed to create menu item.")
  }
}

export async function updateMenuItem(
  id: string,
  data: {
    name: string
    description: string
    price: number
    category: string
    allergens: string
    image: string
    spicyLevel: number
    isVegetarian: boolean
    isVegan: boolean
    isGlutenFree: boolean
    isActive: boolean
  },
) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    if (!restaurantId) throw new Error("Restaurant not found or user not authorized.")

    const menuItem = await prisma.menuItem.update({
      where: { id, restaurantId },
      data,
    })

    await revalidatePath("/restaurant/dashboard/menu")
    return menuItem
  } catch (error) {
    console.error("Failed to update menu item:", error)
    throw new Error("Failed to update menu item.")
  }
}

export async function getInitialOrders() {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) return []

  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      status: {
        in: [
          OrderStatus.PENDING,
          OrderStatus.NEW,
          OrderStatus.ACCEPTED,
          OrderStatus.PREPARING,
          OrderStatus.READY_FOR_PICKUP,
          OrderStatus.OUT_FOR_DELIVERY,
        ],
      },
    },
    include: {
      customerProfile: { include: { user: true } },
      orderItems: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return orders.map((order) => ({
    id: order.id,
    orderNumber: `#${order.id.substring(0, 6).toUpperCase()}`,
    customerName: order.customerProfile.user.name ?? "N/A",
    items: order.orderItems.map((item) => ({
      name: item.menuItem.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.total,
    status: order.status,
    orderTime: order.createdAt.toISOString(),
    estimatedTime: 30,
    deliveryType: order.deliveryAddress ? "delivery" : "pickup",
    deliveryAddress: order.deliveryAddress,
  }))
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) return { success: false, error: "Restaurant not found or user not authorized." }

  try {
    const order = await prisma.order.findFirst({ where: { id: orderId, restaurantId } })
    if (!order) return { success: false, error: "Order not found." }

    const updatedOrder = await prisma.order.update({ where: { id: orderId }, data: { status } })

    const fullUpdatedOrder = await prisma.order.findUnique({
      where: { id: updatedOrder.id },
      include: {
        customerProfile: { include: { user: true } },
        orderItems: { include: { menuItem: true } },
        restaurant: { select: { name: true, address: true } },
      },
    })

    if (fullUpdatedOrder) {
      const serializedOrder = {
        id: fullUpdatedOrder.id,
        orderNumber: `#${fullUpdatedOrder.id.substring(0, 6).toUpperCase()}`,
        customerName: fullUpdatedOrder.customerProfile.user.name ?? "N/A",
        items: fullUpdatedOrder.orderItems.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: fullUpdatedOrder.total,
        status: fullUpdatedOrder.status,
        orderTime: fullUpdatedOrder.createdAt.toISOString(),
        estimatedTime: 30,
        deliveryType: fullUpdatedOrder.deliveryAddress ? "delivery" : "pickup",
        deliveryAddress: fullUpdatedOrder.deliveryAddress,
        restaurant: fullUpdatedOrder.restaurant,
      }

      await emitToRestaurant(restaurantId, "order_status_update", serializedOrder)

      const customerUserId = fullUpdatedOrder.customerProfile.userId
      if (customerUserId) {
        await emitSocketEvent(`user-${customerUserId}`, "order_notification", {
          orderId: fullUpdatedOrder.id,
          status: fullUpdatedOrder.status,
          message: `Your order #${fullUpdatedOrder.id.substring(0, 6).toUpperCase()} is now ${fullUpdatedOrder.status.replace(/_/g, " ").toLowerCase()}.`,
        })
      }

      if (updatedOrder.status === "READY_FOR_PICKUP") {
        await emitSocketEvent("drivers", "new_available_order", serializedOrder)
      }
    }

    await Promise.all([revalidatePath("/restaurant/dashboard/orders"), revalidatePath("/restaurant/dashboard/dockets")])

    return { success: true, order: updatedOrder }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { success: false, error: "Database error." }
  }
}

export async function getMenuItemsForRestaurant(): Promise<MenuItemWithModifications[]> {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) throw new Error("Restaurant not found or user not authorized.")

  return prisma.menuItem.findMany({
    where: { restaurantId },
    include: { modifications: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteMenuItem(id: string) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) throw new Error("Unauthorized")

  await prisma.menuItem.delete({ where: { id, restaurantId } })
  await revalidatePath("/restaurant/dashboard/menu")
}

export async function updateMenuItemActiveStatus(id: string, isActive: boolean) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) throw new Error("Unauthorized")

  await prisma.menuItem.update({
    where: { id, restaurantId },
    data: { isActive },
  })

  await revalidatePath("/restaurant/dashboard/menu")
}

export async function duplicateMenuItem(itemId: string) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) throw new Error("Unauthorized")

  const originalItem = await prisma.menuItem.findUnique({
    where: { id: itemId, restaurantId },
    include: { modifications: true },
  })

  if (!originalItem) throw new Error("Menu item not found")

  const { id, createdAt, updatedAt, modifications, ...dataToCopy } = originalItem

  const newMenuItem = await prisma.menuItem.create({
    data: {
      ...dataToCopy,
      name: `${originalItem.name} (Copy)`,
      restaurantId,
      modifications: {
        create: modifications.map((mod) => ({
          label: mod.label,
          cost: mod.cost,
        })),
      },
    },
    include: { modifications: true },
  })

  await revalidatePath("/restaurant/dashboard/menu")
  return newMenuItem
}

export async function getDriverProfileIdFromSession(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) {
    console.error("No user session found for getting driver ID")
    return null
  }

  try {
    const driverProfile = await prisma.driverProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })

    return driverProfile?.id ?? null
  } catch (error) {
    console.error("Failed to fetch driver profile ID:", error)
    return null
  }
}

export async function getCustomerProfileIdFromSession(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) {
    console.error("No user session found for getting customer ID")
    return null
  }

  try {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })

    return customerProfile?.id ?? null
  } catch (error) {
    console.error("Failed to fetch customer profile ID:", error)
    return null
  }
}
