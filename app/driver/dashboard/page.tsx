import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { DriverDashboardContent } from "@/components/driver/driver-dashboard-content"
import { getInitialDriverData } from "@/app/driver/actions"

export const metadata: Metadata = {
  title: "Driver Dashboard",
  description: "Manage your deliveries and driver profile",
}

export default async function DriverDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/driver/signin")
  }

  if (session.user.role !== UserRole.DRIVER) {
    redirect("/auth/unauthorized")
  }

  // Fetch initial driver data
  const { driver, stats, orders } = await getInitialDriverData()

  if (!driver) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Driver Profile Not Found</h1>
          <p className="text-gray-400">Please complete your driver profile setup.</p>
        </div>
      </div>
    )
  }

  const initialStats = stats || {
    todaysEarnings: "0.00",
    completedDeliveries: 0,
    averageRating: "N/A",
    activeHours: "N/A",
  }

  return (
    <main className="flex flex-1 flex-col">
      <DriverDashboardContent initialDriver={driver} initialStats={initialStats} initialOrders={orders} />
    </main>
  )
}
