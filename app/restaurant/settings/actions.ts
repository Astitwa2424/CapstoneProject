"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as z from "zod"

const accountFormSchema = z.object({
  // Profile fields
  name: z.string().min(2, { message: "Restaurant name must be at least 2 characters." }),
  description: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  cuisine: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  bannerImage: z.string().optional(),

  // Business fields
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  category: z.string().optional(),
  operatingHours: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),

  // Settings fields
  isOpen: z.boolean().default(false),
  deliveryFee: z.coerce.number().min(0).default(0),
  minOrder: z.coerce.number().min(0).default(0),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export async function getRestaurantAccountData() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      return { success: false, error: "Unauthorized" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Default settings if no profile exists
    const defaultSettings = {
      acceptsOnlineOrders: true,
      acceptsReservations: false,
      deliveryRadius: 5,
      deliveryFee: 0,
      minOrderAmount: 0,
      estimatedDeliveryTime: 30,
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      acceptCashOnDelivery: true,
      acceptCardPayments: true,
    }

    return {
      success: true,
      profile: restaurantProfile,
      user,
      settings: defaultSettings,
    }
  } catch (error) {
    console.error("Error fetching restaurant account data:", error)
    return { success: false, error: "Failed to fetch account data" }
  }
}

export async function updateRestaurantAccount(data: AccountFormValues) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      return { success: false, error: "Unauthorized" }
    }

    const validatedData = accountFormSchema.parse(data)

    // This line will be removed, as it incorrectly creates an array.
    // const cuisineArray = validatedData.cuisine ? validatedData.cuisine.split(",").map((s) => s.trim()) : []

    let restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!restaurantProfile) {
      // Create new restaurant profile
      restaurantProfile = await prisma.restaurantProfile.create({
        data: {
          userId: session.user.id,
          name: validatedData.name,
          description: validatedData.description,
          streetAddress: validatedData.streetAddress,
          city: validatedData.city,
          state: validatedData.state,
          postalCode: validatedData.postalCode,
          phone: validatedData.phone,
          // FIX: Use the string directly
          cuisine: validatedData.cuisine,
          website: validatedData.website,
          facebookUrl: validatedData.facebookUrl,
          instagramUrl: validatedData.instagramUrl,
          bannerImage: validatedData.bannerImage,
          businessRegistrationNumber: validatedData.businessRegistrationNumber,
          taxId: validatedData.taxId,
          category: validatedData.category,
          operatingHours: validatedData.operatingHours,
          bankAccountNumber: validatedData.bankAccountNumber,
          bankName: validatedData.bankName,
          isOpen: validatedData.isOpen,
          deliveryFee: validatedData.deliveryFee,
          minOrder: validatedData.minOrder,
        },
      })
    } else {
      // Update existing restaurant profile
      restaurantProfile = await prisma.restaurantProfile.update({
        where: { id: restaurantProfile.id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          streetAddress: validatedData.streetAddress,
          city: validatedData.city,
          state: validatedData.state,
          postalCode: validatedData.postalCode,
          phone: validatedData.phone,
          // FIX: Use the string directly
          cuisine: validatedData.cuisine,
          website: validatedData.website,
          facebookUrl: validatedData.facebookUrl,
          instagramUrl: validatedData.instagramUrl,
          bannerImage: validatedData.bannerImage,
          businessRegistrationNumber: validatedData.businessRegistrationNumber,
          taxId: validatedData.taxId,
          category: validatedData.category,
          operatingHours: validatedData.operatingHours,
          bankAccountNumber: validatedData.bankAccountNumber,
          bankName: validatedData.bankName,
          isOpen: validatedData.isOpen,
          deliveryFee: validatedData.deliveryFee,
          minOrder: validatedData.minOrder,
        },
      })
    }

    revalidatePath("/restaurant/dashboard/account")
    revalidatePath("/restaurant/dashboard/settings")
    revalidatePath("/restaurant/dashboard")

    return { success: true, message: "Account updated successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", issues: error.errors }
    }
    console.error("Error updating restaurant account:", error)
    return { success: false, error: "Failed to update account" }
  }
}
