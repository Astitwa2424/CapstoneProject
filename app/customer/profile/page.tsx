import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfileInformation } from "@/components/customer/profile-information"
import { RecentOrders } from "@/components/customer/recent-orders"
import { PaymentMethods } from "@/components/customer/payment-methods"
import { SavedAddresses } from "@/components/customer/saved-addresses"
import { redirect } from "next/navigation"
import type { User, CustomerProfile } from "@prisma/client"

// Define a more specific type for our user data
type UserWithProfile = User & { customerProfile: CustomerProfile | null }

async function getUserProfile(userId: string): Promise<UserWithProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: true,
    },
  })
  return user
}

async function getRecentOrders(userId: string) {
  const customerProfile = await prisma.customerProfile.findUnique({
    where: { userId: userId },
    select: { id: true },
  })

  if (!customerProfile) {
    return []
  }

  const orders = await prisma.order.findMany({
    where: { customerProfileId: customerProfile.id },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: true,
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
  })
  return orders
}

export default async function CustomerProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Fetch user and orders in parallel for better performance
  const [userProfile, recentOrders] = await Promise.all([
    getUserProfile(session.user.id),
    getRecentOrders(session.user.id),
  ])

  if (!userProfile) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8">
      <ProfileInformation user={userProfile} />
      <RecentOrders orders={recentOrders} />
      <PaymentMethods />
      <SavedAddresses />
    </div>
  )
}
