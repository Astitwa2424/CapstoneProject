import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma" // Correct import
import { getSocketIo } from "@/lib/socket"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    if (!session?.metadata?.orderId) {
      return new NextResponse("Missing metadata: orderId", { status: 400 })
    }

    try {
      const orderId = session.metadata.orderId
      const restaurantId = session.metadata.restaurantId

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "NEW" },
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
      })

      const orderPayload = {
        id: updatedOrder.id,
        orderNumber: updatedOrder.id.slice(-6).toUpperCase(),
        customerName: updatedOrder.customerProfile.user.name || "Guest",
        customerPhone: updatedOrder.customerProfile.phone || "N/A",
        customerAddress: updatedOrder.customerProfile.address || "N/A",
        items: updatedOrder.orderItems.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions || "",
        })),
        total: updatedOrder.total,
        status: "new",
        orderTime: updatedOrder.createdAt.toISOString(),
        estimatedTime: 30,
        paymentMethod: "Card",
        deliveryType: "delivery",
      }

      const io = getSocketIo()
      if (io && restaurantId) {
        io.to(restaurantId).emit("new_order", orderPayload)
        console.log(`Webhook emitted 'new_order' to room ${restaurantId} for order ${orderId}`)
      }
    } catch (dbError) {
      console.error("Database error in webhook:", dbError)
      return new NextResponse("Database update failed", { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
