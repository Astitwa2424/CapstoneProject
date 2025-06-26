import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { UserRole } from "@/lib/auth"

export async function requireAuth() {
  const session = await auth()
  console.log("🔍 requireAuth - Session:", session ? "exists" : "null")
  if (!session?.user) {
    console.log("❌ requireAuth - No session, redirecting to signin")
    redirect("/auth/signin")
  }
  return session
}

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

export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}
