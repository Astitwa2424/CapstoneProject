import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get customer profile
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!customerProfile) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }

    console.log("Searching for active orders for customer:", customerProfile.id)

    // Find the most recent active order
    const activeOrder = await prisma.order.findFirst({
      where: {
        customerProfileId: customerProfile.id,
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
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
      },
    })

    console.log("Found active order:", activeOrder)

    if (!activeOrder) {
      return NextResponse.json({ activeOrder: null })
    }

    return NextResponse.json({ activeOrder })
  } catch (error) {
    console.error("Error fetching active order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
