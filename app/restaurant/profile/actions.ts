"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateRestaurantProfile(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/restaurant/signin")
  }

  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const cuisine = formData.get("cuisine") as string
    const category = formData.get("category") as string
    const website = formData.get("website") as string
    const deliveryFee = Number.parseFloat(formData.get("deliveryFee") as string) || 0
    const minOrder = Number.parseFloat(formData.get("minOrder") as string) || 0
    const businessRegistrationNumber = formData.get("businessRegistrationNumber") as string
    const taxId = formData.get("taxId") as string
    const bankAccountNumber = formData.get("bankAccountNumber") as string
    const bankName = formData.get("bankName") as string
    const swiftCode = formData.get("swiftCode") as string

    // Update or create restaurant profile
    await prisma.restaurantProfile.upsert({
      where: { userId: session.user.id },
      update: {
        name,
        description,
        address,
        phone,
        cuisine: cuisine ? [cuisine] : [],
        category,
        website,
        deliveryFee,
        minOrder,
        businessRegistrationNumber,
        taxId,
        bankAccountNumber,
        bankName,
        swiftCode,
        // Set restaurant as open by default when profile is updated
        isOpen: true,
      },
      create: {
        userId: session.user.id,
        name,
        description,
        address,
        phone,
        cuisine: cuisine ? [cuisine] : [],
        category,
        website,
        deliveryFee,
        minOrder,
        businessRegistrationNumber,
        taxId,
        bankAccountNumber,
        bankName,
        swiftCode,
        isOpen: true,
      },
    })

    // Revalidate all pages that might show restaurant data
    revalidatePath("/restaurant/dashboard")
    revalidatePath("/restaurant/profile")
    revalidatePath("/customer/dashboard")
    revalidatePath("/customer/restaurant")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Error updating restaurant profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}

export async function getRestaurantProfile() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
      profile: null,
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        restaurantProfile: true,
      },
    })

    return {
      success: true,
      profile: user?.restaurantProfile,
    }
  } catch (error) {
    console.error("Error fetching restaurant profile:", error)
    return {
      success: false,
      error: "Failed to fetch profile",
      profile: null,
    }
  }
}
