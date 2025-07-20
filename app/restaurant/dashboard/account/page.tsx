import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getRestaurantAccountData } from "@/app/restaurant/settings/actions"
import { AccountSettingsForm } from "@/components/restaurant/account-settings-form"

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "RESTAURANT") {
    redirect("/auth/restaurant/signin")
  }

  const { profile, settings, user, error } = await getRestaurantAccountData()

  if (error) {
    // You can render a more user-friendly error message here
    return <div>Error loading account data: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account & Settings</h1>
        <p className="text-gray-600">Manage your restaurant profile, settings, and business hours</p>
      </div>

      <AccountSettingsForm initialProfile={profile} initialSettings={settings} userData={user} />
    </div>
  )
}
