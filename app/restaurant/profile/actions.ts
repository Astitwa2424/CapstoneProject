"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as z from "zod"

const restaurantProfileSchema = z.object({
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
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  category: z.string().optional(),
  operatingHours: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  isOpen: z.boolean().default(false),
  deliveryFee: z.coerce.number().min(0).default(0),
  minOrder: z.coerce.number().min(0).default(0),
})

type RestaurantProfileFormValues = z.infer<typeof restaurantProfileSchema>

export async function getRestaurantProfile() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      return { success: false, error: "Unauthorized" }
    }

    const restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
    })

    return {
      success: true,
      profile: restaurantProfile,
    }
  } catch (error) {
    console.error("Error fetching restaurant profile:", error)
    return { success: false, error: "Failed to fetch profile data" }
  }
}

export async function updateRestaurantProfile(
  data: FormData | RestaurantProfileFormValues,
): Promise<{ success: boolean; error?: string; message?: string; issues?: any[] }> {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      return { success: false, error: "Unauthorized" }
    }

    console.log("Profile input data type:", typeof data)
    console.log("Profile is FormData:", data instanceof FormData)

    // Convert input to plain object
    let formObject: Record<string, any> = {}

    if (data instanceof FormData) {
      // Handle FormData
      console.log("Processing FormData for profile...")
      for (const [key, value] of data.entries()) {
        if (typeof value === "string") {
          // Handle boolean fields
          if (key === "isOpen") {
            formObject[key] = value === "true"
          } else if (key === "deliveryFee" || key === "minOrder") {
            // Handle numeric fields
            const numValue = Number.parseFloat(value)
            formObject[key] = isNaN(numValue) ? 0 : numValue
          } else {
            formObject[key] = value
          }
        }
      }
    } else {
      // Handle plain object
      console.log("Processing plain object for profile...")
      formObject = { ...data }
    }

    console.log("Profile form object processed:", formObject)

    // Validate the data
    const validatedData = restaurantProfileSchema.parse(formObject)
    console.log("Profile validated data:", validatedData)

    let restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Prepare update data with proper null handling
    const updateData = {
      name: validatedData.name,
      description: validatedData.description || null,
      streetAddress: validatedData.streetAddress || null,
      city: validatedData.city || null,
      state: validatedData.state || null,
      postalCode: validatedData.postalCode || null,
      phone: validatedData.phone || null,
      cuisine: validatedData.cuisine || null,
      website: validatedData.website || null,
      facebookUrl: validatedData.facebookUrl || null,
      instagramUrl: validatedData.instagramUrl || null,
      // Only store HTTP URLs, not base64 data
      bannerImage:
        validatedData.bannerImage && validatedData.bannerImage.startsWith("http") ? validatedData.bannerImage : null,
      businessRegistrationNumber: validatedData.businessRegistrationNumber || null,
      taxId: validatedData.taxId || null,
      category: validatedData.category || null,
      operatingHours: validatedData.operatingHours || null,
      bankAccountNumber: validatedData.bankAccountNumber || null,
      bankName: validatedData.bankName || null,
      isOpen: validatedData.isOpen,
      deliveryFee: validatedData.deliveryFee,
      minOrder: validatedData.minOrder,
    }

    console.log("Profile update data prepared:", updateData)

    if (!restaurantProfile) {
      // Create new restaurant profile
      restaurantProfile = await prisma.restaurantProfile.create({
        data: {
          userId: session.user.id,
          ...updateData,
        },
      })
      console.log("Created new restaurant profile:", restaurantProfile.id)
    } else {
      // Update existing restaurant profile
      restaurantProfile = await prisma.restaurantProfile.update({
        where: { id: restaurantProfile.id },
        data: updateData,
      })
      console.log("Updated existing restaurant profile:", restaurantProfile.id)
    }

    revalidatePath("/restaurant/profile")
    revalidatePath("/restaurant/dashboard")

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Error updating restaurant profile:", error)

    if (error instanceof z.ZodError) {
      console.error("Profile validation errors:", error.errors)
      return { success: false, error: "Validation failed", issues: error.errors }
    }

    // Handle Prisma/Database errors
    if (error instanceof Error) {
      if (error.message.includes("index row requires")) {
        return { success: false, error: "Image data too large. Please use a smaller image or image URL." }
      }
      if (error.message.includes("Unique constraint")) {
        return { success: false, error: "A restaurant with this information already exists." }
      }
    }

    return { success: false, error: "Failed to update profile" }
  }
}
