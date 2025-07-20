"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import * as z from "zod"

const profileFormSchema = z.object({
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
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export async function updateRestaurantProfile(data: ProfileFormValues) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/restaurant/signin")
  }

  try {
    const validatedData = profileFormSchema.parse(data)

    // Get or create restaurant profile first
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
          cuisine: validatedData.cuisine ? validatedData.cuisine.split(",").map((s) => s.trim()) : [],
          website: validatedData.website,
          facebookUrl: validatedData.facebookUrl,
          instagramUrl: validatedData.instagramUrl,
          bannerImage: validatedData.bannerImage,
        },
      })
    } else {
      // Update existing restaurant profile
      const cuisineArray = validatedData.cuisine ? validatedData.cuisine.split(",").map((s) => s.trim()) : []

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
          cuisine: cuisineArray,
          website: validatedData.website,
          facebookUrl: validatedData.facebookUrl,
          instagramUrl: validatedData.instagramUrl,
          bannerImage: validatedData.bannerImage,
        },
      })
    }

    revalidatePath("/restaurant/profile")
    revalidatePath("/restaurant/dashboard")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", issues: error.errors }
    }
    console.error("Error updating restaurant profile:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return { success: false, error: errorMessage }
  }
}

export async function getRestaurantProfile() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
      profile: null,
      user: null,
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    const restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
    })

    return {
      success: true,
      profile: restaurantProfile,
      user,
    }
  } catch (error) {
    console.error("Error fetching restaurant profile:", error)
    return {
      success: false,
      error: "Failed to fetch profile",
      profile: null,
      user: null,
    }
  }
}
