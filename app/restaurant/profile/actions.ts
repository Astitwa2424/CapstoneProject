"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateRestaurantProfile(formData: FormData) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      throw new Error("Unauthorized")
    }

    const userId = session.user.id

    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const description = formData.get("description") as string
    const address = formData.get("address") as string
    const businessRegistrationNumber = formData.get("businessRegistrationNumber") as string
    const taxId = formData.get("taxId") as string
    const category = formData.get("category") as string
    const website = formData.get("website") as string
    const facebookUrl = formData.get("facebookUrl") as string
    const instagramUrl = formData.get("instagramUrl") as string
    const twitterUrl = formData.get("twitterUrl") as string
    const streetAddress = formData.get("streetAddress") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const postalCode = formData.get("postalCode") as string
    const country = formData.get("country") as string
    const bankAccountNumber = formData.get("bankAccountNumber") as string
    const bankName = formData.get("bankName") as string
    const swiftCode = formData.get("swiftCode") as string
    const deliveryFee = Number.parseFloat(formData.get("deliveryFee") as string) || 0
    const minOrder = Number.parseFloat(formData.get("minOrder") as string) || 0

    // Get cuisine as array
    const cuisineString = formData.get("cuisine") as string
    const cuisine = cuisineString ? cuisineString.split(",").map((c) => c.trim()) : []

    // Use transaction to update both User and RestaurantProfile
    await prisma.$transaction(async (tx) => {
      // Update user email if provided
      if (email && email !== session.user.email) {
        await tx.user.update({
          where: { id: userId },
          data: { email },
        })
      }

      // Update or create restaurant profile
      await tx.restaurantProfile.upsert({
        where: { userId },
        update: {
          name: name || "Restaurant",
          description,
          phone: phone || "PENDING",
          address: address || "PENDING",
          cuisine: cuisine.length > 0 ? cuisine : ["PENDING"],
          businessRegistrationNumber,
          taxId,
          category,
          website,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          streetAddress,
          city,
          state,
          postalCode,
          country,
          bankAccountNumber,
          bankName,
          swiftCode,
          deliveryFee,
          minOrder,
        },
        create: {
          userId,
          name: name || "Restaurant",
          description,
          phone: phone || "PENDING",
          address: address || "PENDING",
          cuisine: cuisine.length > 0 ? cuisine : ["PENDING"],
          businessRegistrationNumber,
          taxId,
          category,
          website,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          streetAddress,
          city,
          state,
          postalCode,
          country,
          bankAccountNumber,
          bankName,
          swiftCode,
          deliveryFee,
          minOrder,
        },
      })
    })

    revalidatePath("/restaurant/dashboard")
    revalidatePath("/restaurant/dashboard/account")

    return { success: true, message: "Profile updated successfully!" }
  } catch (error) {
    console.error("Error updating restaurant profile:", error)
    return { success: false, message: "Failed to update profile. Please try again." }
  }
}

export async function getRestaurantProfile() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      return { success: false, profile: null }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        restaurant: true,
      },
    })

    return {
      success: true,
      profile: user?.restaurant,
      user: {
        email: user?.email,
        name: user?.name,
      },
    }
  } catch (error) {
    console.error("Error fetching restaurant profile:", error)
    return { success: false, profile: null }
  }
}
