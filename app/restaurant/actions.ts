"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Modification } from "@prisma/client"

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
  isActive?: boolean
}

async function getRestaurantIdFromSession() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const restaurantProfile = await prisma.restaurantProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!restaurantProfile) throw new Error("Restaurant profile not found")
  return restaurantProfile.id
}

export async function createMenuItem(data: MenuItemFormData) {
  try {
    const restaurantId = await getRestaurantIdFromSession()

    const allergensArray = data.allergens
      ? data.allergens.split(",").map((s) => s.trim())
      : []

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId,
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
        isActive: data.isActive ?? true,
      },
    })

    revalidatePath("/customer/dashboard")
    revalidatePath(`/customer/restaurant/${restaurantId}`)

    return {
      success: true,
      menuItem,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function updateMenuItem(menuItemId: string, data: MenuItemFormData) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    const allergensArray = data.allergens
      ? data.allergens.split(",").map((s) => s.trim())
      : []

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: menuItemId, restaurantId },
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
        isActive: data.isActive ?? true,
      },
    })

    revalidatePath("/customer/dashboard")
    revalidatePath(`/customer/restaurant/${restaurantId}`)
    revalidatePath(`/restaurant/dashboard/menu/${menuItemId}/edit`)

    return {
      success: true,
      menuItem: updatedMenuItem,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function getMenuItemsForRestaurant() {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId },
      include: { modifications: true },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      menuItems,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
      menuItems: [],
    }
  }
}

export async function deleteMenuItem(menuItemId: string) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    await prisma.menuItem.delete({
      where: { id: menuItemId, restaurantId },
    })

    revalidatePath("/customer/dashboard")
    revalidatePath(`/customer/restaurant/${restaurantId}`)

    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function updateMenuItemActiveStatus(menuItemId: string, isActive: boolean) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    await prisma.menuItem.update({
      where: { id: menuItemId, restaurantId },
      data: { isActive },
    })

    revalidatePath("/customer/dashboard")
    revalidatePath(`/customer/restaurant/${restaurantId}`)

    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function duplicateMenuItem(menuItemId: string) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    const originalItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId, restaurantId },
      include: { modifications: true },
    })

    if (!originalItem) throw new Error("Original item not found")

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
    return {
      success: true,
      menuItem: duplicatedItem,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function getMenuItemById(menuItemId: string) {
  try {
    const restaurantId = await getRestaurantIdFromSession()
    const menuItem = await prisma.menuItem.findFirst({
      where: { id: menuItemId, restaurantId },
      include: { modifications: true },
    })

    if (!menuItem) {
      return {
        success: false,
        error: "Menu item not found",
      }
    }

    return {
      success: true,
      menuItem,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return {
      success: false,
      error: errorMessage,
    }
  }
}
