"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/customer/signin")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const dateOfBirth = formData.get("dateOfBirth") as string

  try {
    // Update user basic info
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    })

    // Create or update customer profile
    await prisma.customerProfile.upsert({
      where: { userId: session.user.id },
      update: {},
      create: {
        userId: session.user.id,
      },
    })

    revalidatePath("/customer/profile")
    return { success: true, message: "Profile updated successfully!" }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, message: "Failed to update profile. Please try again." }
  }
}
