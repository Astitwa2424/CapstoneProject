"use server"

import { revalidatePath } from "next/cache"
import { OrderStatus, type Modification, type MenuItem } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getRestaurantIdFromSession } from "@/lib/auth-utils"
import { emitSocketEvent } from "@/lib/socket-server"

export type MenuItemWithModifications = MenuItem & {
  modifications: Modification[]
}

// Get a single menu item by ID
export async function getMenuItemById(id: string) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    if (!restaurantId) {
      return { success: false, error: "Restaurant not found or user not authorized." }
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id,
        restaurantId, // Ensure the menu item belongs to this restaurant
      },
      include: {
        modifications: true,
      },
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

// Create a new menu item
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
    if (!restaurantId) {
      throw new Error("Restaurant not found or user not authorized.")
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        ...data,
        restaurantId,
      },
    })

    revalidatePath("/restaurant/dashboard/menu")
    return menuItem
  } catch (error) {
    console.error("Failed to create menu item:", error)
    throw new Error("Failed to create menu item.")
  }
}

// Update an existing menu item
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
    if (!restaurantId) {
      throw new Error("Restaurant not found or user not authorized.")
    }

    const menuItem = await prisma.menuItem.update({
      where: {
        id,
        restaurantId, // Ensure the menu item belongs to this restaurant
      },
      data,
    })

    revalidatePath("/restaurant/dashboard/menu")
    return menuItem
  } catch (error) {
    console.error("Failed to update menu item:", error)
    throw new Error("Failed to update menu item.")
  }
}

// Fetch initial orders for the restaurant dashboard
export async function getInitialOrders() {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) {
    return []
  }

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: restaurantId,
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
      customerProfile: {
        include: {
          user: true,
        },
      },
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
    deliveryType: order.deliveryAddress ? ("delivery" as const) : ("pickup" as const),
    deliveryAddress: order.deliveryAddress,
  }))
}

// Update the status of an order
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) {
    return { success: false, error: "Restaurant not found or user not authorized." }
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId: restaurantId,
      },
    })

    if (!order) {
      return { success: false, error: "Order not found.", currentStatus: order?.status }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    // After updating, find the full order details to emit
    const fullUpdatedOrder = await prisma.order.findUnique({
      where: { id: updatedOrder.id },
      include: {
        customerProfile: { include: { user: true } },
        orderItems: { include: { menuItem: true } },
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
        deliveryType: fullUpdatedOrder.deliveryAddress ? ("delivery" as const) : ("pickup" as const),
        deliveryAddress: fullUpdatedOrder.deliveryAddress,
      }

      // Emit to restaurant room
      const restaurantRoom = `restaurant_${restaurantId}`
      await emitSocketEvent(restaurantRoom, "order_status_update", serializedOrder)

      // Emit to customer room
      const customerUserId = fullUpdatedOrder.customerProfile.userId
      if (customerUserId) {
        const customerRoom = `user_${customerUserId}`
        const notificationPayload = {
          orderId: fullUpdatedOrder.id,
          status: fullUpdatedOrder.status,
          message: `Your order #${fullUpdatedOrder.id
            .substring(0, 6)
            .toUpperCase()} is now ${fullUpdatedOrder.status.replace(/_/g, " ").toLowerCase()}.`,
        }
        await emitSocketEvent(customerRoom, "order_notification", notificationPayload)
        await emitSocketEvent(`order_${fullUpdatedOrder.id}`, "order_notification", notificationPayload)
      }

      if (status === "READY_FOR_PICKUP") {
        // Emit to all available drivers
        await emitSocketEvent("drivers_available", "new_order_for_driver", serializedOrder)

        // Also emit general order status update for driver dashboard
        await emitSocketEvent("drivers_all", "order_status_update", {
          orderId: fullUpdatedOrder.id,
          status: fullUpdatedOrder.status,
        })
      }
    }

    revalidatePath("/restaurant/dashboard/orders")
    revalidatePath("/restaurant/dashboard/dockets")
    return { success: true, order: updatedOrder }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { success: false, error: "Database error.", currentStatus: status }
  }
}

// Fetch all menu items for the restaurant
export async function getMenuItemsForRestaurant(): Promise<MenuItemWithModifications[]> {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) {
    throw new Error("Restaurant not found or user not authorized.")
  }

  return prisma.menuItem.findMany({
    where: { restaurantId },
    include: {
      modifications: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

// Delete a menu item
export async function deleteMenuItem(id: string) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) {
    throw new Error("Unauthorized")
  }

  await prisma.menuItem.delete({
    where: { id, restaurantId },
  })

  revalidatePath("/restaurant/dashboard/menu")
}

// Update a menu item's active status
export async function updateMenuItemActiveStatus(id: string, isActive: boolean) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) {
    throw new Error("Unauthorized")
  }

  await prisma.menuItem.update({
    where: { id, restaurantId },
    data: { isActive },
  })

  revalidatePath("/restaurant/dashboard/menu")
}

// Duplicate a menu item
export async function duplicateMenuItem(itemId: string) {
  const restaurantId = await getRestaurantIdFromSession()
  if (!restaurantId) {
    throw new Error("Unauthorized")
  }

  const originalItem = await prisma.menuItem.findUnique({
    where: { id: itemId, restaurantId },
    include: {
      modifications: true,
    },
  })

  if (!originalItem) {
    throw new Error("Menu item not found")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, modifications, ...dataToCopy } = originalItem

  const newMenuItem = await prisma.menuItem.create({
    data: {
      ...dataToCopy,
      name: `${originalItem.name} (Copy)`,
      modifications: {
        create: modifications.map((mod: Modification) => ({
          label: mod.label,
          cost: mod.cost,
        })),
      },
    },
    include: {
      modifications: true,
    },
  })

  revalidatePath("/restaurant/dashboard/menu")
  return newMenuItem
}

export async function updateRestaurantAccount(data: any) {
  // Alias for updateOrderStatus - this function handles restaurant account updates
  return updateOrderStatus(data.orderId, data.status)
}

export async function updateRestaurantSettings(data: any) {
  // Alias for updateMenuItem - this function handles restaurant settings updates
  return updateMenuItem(data.id, data)
}

export async function getRestaurantAccountData() {
  // Returns restaurant menu items and initial orders for account data
  try {
    const menuItems = await getMenuItemsForRestaurant()
    const orders = await getInitialOrders()
    return { success: true, menuItems, orders }
  } catch (error) {
    console.error("Failed to get restaurant account data:", error)
    return { success: false, error: "Failed to get restaurant account data." }
  }
}
