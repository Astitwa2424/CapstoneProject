import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfileInformation } from "@/components/customer/profile-information"
import { RecentOrders } from "@/components/customer/recent-orders"
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

async function getPaymentMethods(userId: string) {
  const customerProfile = await prisma.customerProfile.findUnique({
    where: { userId: userId },
    include: {
      paymentMethods: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
  return customerProfile?.paymentMethods || []
}

export default async function CustomerProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Fetch user, orders, and payment methods in parallel for better performance
  const [userProfile, recentOrders, paymentMethods] = await Promise.all([
    getUserProfile(session.user.id),
    getRecentOrders(session.user.id),
    getPaymentMethods(session.user.id),
  ])

  if (!userProfile) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8">
      <ProfileInformation user={userProfile} />
      <RecentOrders orders={recentOrders} />
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    {method.type.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">•••• {method.last4}</div>
                    <div className="text-sm text-gray-500">{method.cardHolder}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {method.expiryMonth}/{method.expiryYear.slice(-2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No payment methods saved.</p>
        )}
      </div>
      <SavedAddresses />
    </div>
  )
}
