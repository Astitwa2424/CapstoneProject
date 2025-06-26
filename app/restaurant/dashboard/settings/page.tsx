import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SupportCenter } from "@/components/restaurant/support-center"

export default async function SupportPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "RESTAURANT") {
    redirect("/auth/restaurant/signin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600">Get help with your restaurant operations and platform features</p>
      </div>

      <SupportCenter />
    </div>
  )
}
