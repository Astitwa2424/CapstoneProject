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
  logoImage: z.string().optional(),

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

// Overloaded function to handle both FormData and plain objects
export async function updateRestaurantAccount(
  data: FormData | AccountFormValues,
): Promise<{ success: boolean; error?: string; message?: string; issues?: any[] }> {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "RESTAURANT") {
      return { success: false, error: "Unauthorized" }
    }

    console.log("Input data type:", typeof data)
    console.log("Is FormData:", data instanceof FormData)

    // Convert input to plain object
    let formObject: Record<string, any> = {}

    if (data instanceof FormData) {
      // Handle FormData
      console.log("Processing FormData...")
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
      console.log("Processing plain object...")
      formObject = { ...data }
    }

    console.log("Form object processed:", formObject)

    // Validate the data
    const validatedData = accountFormSchema.parse(formObject)
    console.log("Validated data:", validatedData)

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
      // Handle cuisine as string, not array to avoid index size issues
      cuisine: validatedData.cuisine || null,
      website: validatedData.website || null,
      facebookUrl: validatedData.facebookUrl || null,
      instagramUrl: validatedData.instagramUrl || null,
      logoImage:
        validatedData.logoImage &&
        (validatedData.logoImage.startsWith("http") || validatedData.logoImage.startsWith("/uploads/"))
          ? validatedData.logoImage
          : null,
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

    console.log("Update data prepared:", updateData)

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

    revalidatePath("/restaurant/dashboard/account")
    revalidatePath("/restaurant/dashboard/settings")
    revalidatePath("/restaurant/dashboard")

    return { success: true, message: "Account updated successfully" }
  } catch (error) {
    console.error("Error updating restaurant account:", error)

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
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

    return { success: false, error: "Failed to update account" }
  }
}
