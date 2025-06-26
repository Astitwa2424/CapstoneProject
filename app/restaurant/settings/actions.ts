"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface RestaurantSettings {
  restaurantName: string
  description?: string
  phone?: string
  email?: string
  address?: string
  isOpen: boolean
  acceptsOnlineOrders: boolean
  acceptsReservations: boolean
  enableNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  deliveryRadius: number
  estimatedDeliveryTime: number
  maxOrdersPerHour: number

  // Operating Hours
  monday: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
  tuesday: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
  wednesday: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
  thursday: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
  friday: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
  saturday: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }
  sunday: {
    isOpen: boolean
    openTime: string
    closeTime: string
  }

  // Payment Settings
  acceptCashOnDelivery: boolean
  acceptCardPayments: boolean

  // Security Settings
  twoFactorEnabled: boolean
  sessionTimeout: number
}

export async function getRestaurantSettings(): Promise<{
  success: boolean
  settings?: RestaurantSettings
  error?: string
}> {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      return { success: false, settings: null }
    }

    const restaurant = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
    })

    return {
      success: true,
      settings: restaurant,
    }
  } catch (error) {
    console.error("Error fetching restaurant settings:", error)
    return { success: false, settings: null }
  }
}

export async function updateRestaurantSettings(formData: FormData) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      throw new Error("Unauthorized")
    }

    const userId = session.user.id

    // Extract settings data
    const isOpen = formData.get("isOpen") === "true"
    const acceptsOnlineOrders = formData.get("acceptsOnlineOrders") === "true"
    const acceptsReservations = formData.get("acceptsReservations") === "true"
    const enableNotifications = formData.get("enableNotifications") === "true"
    const emailNotifications = formData.get("emailNotifications") === "true"
    const smsNotifications = formData.get("smsNotifications") === "true"
    const deliveryRadius = Number.parseFloat(formData.get("deliveryRadius") as string) || 5
    const estimatedDeliveryTime = Number.parseInt(formData.get("estimatedDeliveryTime") as string) || 30
    const maxOrdersPerHour = Number.parseInt(formData.get("maxOrdersPerHour") as string) || 20

    // Operating hours
    const operatingHours = {
      monday: {
        isOpen: formData.get("monday_isOpen") === "true",
        openTime: (formData.get("monday_openTime") as string) || "09:00",
        closeTime: (formData.get("monday_closeTime") as string) || "22:00",
      },
      tuesday: {
        isOpen: formData.get("tuesday_isOpen") === "true",
        openTime: (formData.get("tuesday_openTime") as string) || "09:00",
        closeTime: (formData.get("tuesday_closeTime") as string) || "22:00",
      },
      wednesday: {
        isOpen: formData.get("wednesday_isOpen") === "true",
        openTime: (formData.get("wednesday_openTime") as string) || "09:00",
        closeTime: (formData.get("wednesday_closeTime") as string) || "22:00",
      },
      thursday: {
        isOpen: formData.get("thursday_isOpen") === "true",
        openTime: (formData.get("thursday_openTime") as string) || "09:00",
        closeTime: (formData.get("thursday_closeTime") as string) || "22:00",
      },
      friday: {
        isOpen: formData.get("friday_isOpen") === "true",
        openTime: (formData.get("friday_openTime") as string) || "09:00",
        closeTime: (formData.get("friday_closeTime") as string) || "22:00",
      },
      saturday: {
        isOpen: formData.get("saturday_isOpen") === "true",
        openTime: (formData.get("saturday_openTime") as string) || "09:00",
        closeTime: (formData.get("saturday_closeTime") as string) || "22:00",
      },
      sunday: {
        isOpen: formData.get("sunday_isOpen") === "true",
        openTime: (formData.get("sunday_openTime") as string) || "09:00",
        closeTime: (formData.get("sunday_closeTime") as string) || "22:00",
      },
    }

    await prisma.restaurantProfile.upsert({
      where: { userId },
      update: {
        isOpen,
        operatingHours,
        acceptsOnlineOrders,
        acceptsReservations,
        enableNotifications,
        emailNotifications,
        smsNotifications,
        deliveryRadius,
        estimatedDeliveryTime,
        maxOrdersPerHour,
      },
      create: {
        userId,
        name: "Restaurant",
        phone: "PENDING",
        address: "PENDING",
        cuisine: ["PENDING"],
        isOpen,
        operatingHours,
        acceptsOnlineOrders,
        acceptsReservations,
        enableNotifications,
        emailNotifications,
        smsNotifications,
        deliveryRadius,
        estimatedDeliveryTime,
        maxOrdersPerHour,
      },
    })

    revalidatePath("/restaurant/dashboard/settings")

    return { success: true, message: "Settings updated successfully!" }
  } catch (error) {
    console.error("Error updating restaurant settings:", error)
    return { success: false, message: "Failed to update settings. Please try again." }
  }
}
