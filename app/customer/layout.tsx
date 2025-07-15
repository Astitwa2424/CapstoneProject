import type { ReactNode } from "react"
import DashboardHeader from "@/components/customer/dashboard-header"

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main>{children}</main>
    </div>
  )
}
