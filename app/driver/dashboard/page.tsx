import { getDriverProfile, getDriverDashboardStats, getAvailableOrders } from "@/app/driver/actions"
import { DriverDashboardClient } from "@/components/driver/driver-dashboard-client"
import { Suspense } from "react"

export default async function DriverDashboard() {
  const [driverProfile, stats, availableOrders] = await Promise.all([
    getDriverProfile(),
    getDriverDashboardStats(),
    getAvailableOrders(),
  ])

  if (!driverProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Driver Profile Not Found</h1>
          <p className="text-gray-600">Please complete your driver profile setup.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-screen" />}>
        <DriverDashboardClient driverProfile={driverProfile} initialStats={stats} initialOrders={availableOrders} />
      </Suspense>
    </div>
  )
}
