"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Modification } from "@prisma/client"

export interface MenuItemFormData {
  name: string
  description: string
  price: number
  category: string
  allergens: string
  image?: string
  spicyLevel?: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
}

export async function checkDatabaseSetup() {
  try {
    const count = await prisma.menuItem.count()
    return { success: true, message: `Database connected. Found ${count} menu items.` }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Database setup check failed:", errorMessage)
    return { success: false, message: `Database error: ${errorMessage}` }
  }
}

export async function createMenuItem(data: MenuItemFormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!restaurantProfile) {
      return { success: false, error: "Restaurant profile not found" }
    }

    let allergensArray: string[] = []
    if (data.allergens) {
      try {
        allergensArray = Array.isArray(data.allergens)
          ? data.allergens
          : data.allergens
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
      } catch {
        allergensArray = []
      }
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: restaurantProfile.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        allergens: allergensArray,
        image: data.image || null,
        spicyLevel: data.spicyLevel || 0,
        isVegetarian: data.isVegetarian || false,
        isVegan: data.isVegan || false,
        isGlutenFree: data.isGlutenFree || false,
      },
    })

    revalidatePath("/restaurant/dashboard/menu")
    return { success: true, menuItem }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error creating menu item:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function getMenuItemById(menuItemId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurant: {
          userId: session.user.id,
        },
      },
      include: {
        modifications: true,
      },
    })

    if (!menuItem) {
      return { success: false, error: "Menu item not found or unauthorized" }
    }

    return { success: true, menuItem }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error fetching menu item:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function updateMenuItem(menuItemId: string, data: MenuItemFormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurant: {
          userId: session.user.id,
        },
      },
    })

    if (!existingItem) {
      return { success: false, error: "Menu item not found or unauthorized" }
    }

    let allergensArray: string[] = []
    if (data.allergens) {
      try {
        allergensArray = Array.isArray(data.allergens)
          ? data.allergens
          : data.allergens
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
      } catch {
        allergensArray = []
      }
    }

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        allergens: allergensArray,
        image: data.image || null,
        spicyLevel: data.spicyLevel || 0,
        isVegetarian: data.isVegetarian || false,
        isVegan: data.isVegan || false,
        isGlutenFree: data.isGlutenFree || false,
      },
    })

    revalidatePath("/restaurant/dashboard/menu")
    revalidatePath(`/restaurant/dashboard/menu/${menuItemId}/edit`)
    return { success: true, menuItem: updatedMenuItem }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error updating menu item:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function getMenuItemsForRestaurant() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated", menuItems: [] }
    }

    const restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        menuItems: {
          include: {
            modifications: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!restaurantProfile) {
      return { success: false, error: "Restaurant profile not found", menuItems: [] }
    }

    return { success: true, menuItems: restaurantProfile.menuItems }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error fetching menu items:", errorMessage)
    return { success: false, error: errorMessage, menuItems: [] }
  }
}

export async function deleteMenuItem(menuItemId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurant: {
          userId: session.user.id,
        },
      },
    })

    if (!menuItem) {
      return { success: false, error: "Menu item not found or unauthorized" }
    }

    await prisma.menuItem.delete({
      where: { id: menuItemId },
    })

    revalidatePath("/restaurant/dashboard/menu")
    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error deleting menu item:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function updateMenuItemActiveStatus(menuItemId: string, isActive: boolean) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurant: {
          userId: session.user.id,
        },
      },
    })

    if (!menuItem) {
      return { success: false, error: "Menu item not found or unauthorized" }
    }

    await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { isActive },
    })

    revalidatePath("/restaurant/dashboard/menu")
    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error updating menu item status:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

export async function duplicateMenuItem(menuItemId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    const originalItem = await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurant: {
          userId: session.user.id,
        },
      },
      include: {
        modifications: true,
      },
    })

    if (!originalItem) {
      return { success: false, error: "Menu item not found or unauthorized" }
    }

    const duplicatedItem = await prisma.menuItem.create({
      data: {
        restaurantId: originalItem.restaurantId,
        name: `${originalItem.name} (Copy)`,
        description: originalItem.description,
        price: originalItem.price,
        category: originalItem.category,
        allergens: originalItem.allergens,
        image: originalItem.image,
        spicyLevel: originalItem.spicyLevel,
        isVegetarian: originalItem.isVegetarian,
        isVegan: originalItem.isVegan,
        isGlutenFree: originalItem.isGlutenFree,
        isActive: false,
      },
    })

    if (originalItem.modifications.length > 0) {
      await prisma.modification.createMany({
        data: originalItem.modifications.map((mod: Modification) => ({
          menuItemId: duplicatedItem.id,
          label: mod.label,
          cost: mod.cost,
        })),
      })
    }

    revalidatePath("/restaurant/dashboard/menu")
    return { success: true, menuItem: duplicatedItem }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    console.error("Error duplicating menu item:", errorMessage)
    return { success: false, error: errorMessage }
  }
}
