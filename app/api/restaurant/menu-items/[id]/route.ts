import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { getRestaurantIdFromSession } from "@/lib/auth-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "RESTAURANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const restaurantId = await getRestaurantIdFromSession()
    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    const body = await request.json()
    const { isActive } = body

    const menuItem = await prisma.menuItem.update({
      where: {
        id: params.id,
        restaurantId: restaurantId,
      },
      data: {
        isActive: isActive,
      },
    })

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Failed to update menu item:", error)
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "RESTAURANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const restaurantId = await getRestaurantIdFromSession()
    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    await prisma.menuItem.delete({
      where: {
        id: params.id,
        restaurantId: restaurantId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete menu item:", error)
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    )
  }
}
