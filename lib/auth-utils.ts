import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/lib/auth"

/**
 * Ensures the user is authenticated, otherwise redirects to sign-in.
 */
export async function requireAuth() {
  const session = await auth()
  console.log("🔍 requireAuth - Session:", session ? "exists" : "null")
  if (!session?.user) {
    console.log("❌ requireAuth - No session, redirecting to signin")
    redirect("/auth/signin")
  }
  return session
}

/**
 * Ensures the user is authenticated and has one of the allowed roles.
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await auth()
  console.log("🔍 requireRole - Session:", session ? "exists" : "null")
  console.log("🔍 requireRole - User role:", session?.user?.role)
  console.log("🔍 requireRole - Allowed roles:", allowedRoles)

  if (!session?.user) {
    console.log("❌ requireRole - No session, redirecting to signin")
    redirect("/auth/signin")
  }

  if (!allowedRoles.includes(session.user.role)) {
    console.log("❌ requireRole - Role not allowed, redirecting to unauthorized")
    redirect("/unauthorized")
  }

  console.log("✅ requireRole - Access granted")
  return session
}

/**
 * Returns the currently logged-in user or null.
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

/**
 * Returns the customer profile or creates one if it doesn't exist.
 */
export async function getCustomerProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("User not authenticated or session expired.")
  }

  let customerProfile = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!customerProfile) {
    customerProfile = await prisma.customerProfile.create({
      data: {
        userId: session.user.id,
        phone: "",
        address: "",
      },
    })
  }

  return customerProfile
}

/**
 * Fetches the restaurant ID associated with the currently logged-in user.
 */
export async function getRestaurantIdFromSession(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) {
    console.error("No user session found for getting restaurant ID")
    return null
  }

  try {
    const restaurantProfile = await prisma.restaurantProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    })

    return restaurantProfile?.id ?? null
  } catch (error) {
    console.error("Failed to fetch restaurant profile ID:", error)
    return null
  }
}
