import type { ReactNode } from "react"
import { auth } from "@/lib/auth"
import DashboardHeader from "@/components/customer/dashboard-header"
import SocketNotificationHandler from "@/components/customer/socket-notification-handler"

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  const userId = session?.user?.id

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      {/* The handler is now a client component that gets session internally */}
      {userId && <SocketNotificationHandler />}
      <main>{children}</main>
    </div>
  )
}
