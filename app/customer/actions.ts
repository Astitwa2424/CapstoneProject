"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getSocketIo } from "@/lib/socket"
import type { CartItem } from "@/hooks/use-cart"

export async function placeOrder(cart: CartItem[], restaurantId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" }
  }
  const userId = session.user.id

  if (cart.length === 0) {
    return { success: false, error: "Cart is empty" }
  }

  try {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!customerProfile) {
      return { success: false, error: "Customer profile not found." }
    }

    const restaurant = await prisma.restaurantProfile.findUnique({
      where: { id: restaurantId },
      select: { name: true },
    })

    if (!restaurant) {
      return { success: false, error: "Restaurant not found" }
    }

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const deliveryFee = 2.99 // Example fee
    const taxes = subtotal * 0.1 // Example 10% tax
    const total = subtotal + deliveryFee + taxes

    // Create the order in the database
    const newOrder = await prisma.order.create({
      data: {
        total,
        status: "PENDING",
        customerProfileId: customerProfile.id,
        restaurantId: restaurantId,
        orderItems: {
          create: cart.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            specialInstructions: item.specialInstructions,
            menuItemId: item.id,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    // Create order payload for real-time notification
    const orderPayload = {
      id: newOrder.id,
      orderNumber: newOrder.id.slice(-6).toUpperCase(),
      customerName: session.user.name || "Guest",
      items: newOrder.orderItems.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions || "",
      })),
      total: newOrder.total,
      status: "new",
      orderTime: newOrder.createdAt.toISOString(),
      paymentMethod: "Online",
      deliveryType: "delivery",
    }

    // Emit event to the specific restaurant's room
    const io = getSocketIo()
    if (io) {
      io.to(restaurantId).emit("new_order", orderPayload)
      console.log(`Emitted 'new_order' to room ${restaurantId}`)
    } else {
      console.error("Socket.IO server not available to emit event.")
    }

    return { success: true, message: "Order placed successfully! The restaurant has been notified." }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error placing order:", errorMessage)
    return { success: false, error: "Failed to place order. " + errorMessage }
  }
}
