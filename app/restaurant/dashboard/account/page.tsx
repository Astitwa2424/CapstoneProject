import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getRestaurantProfile } from "@/app/restaurant/profile/actions"
import { getRestaurantSettings } from "@/app/restaurant/settings/actions"
import { AccountSettingsForm } from "@/components/restaurant/account-settings-form"

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "RESTAURANT") {
    redirect("/auth/restaurant/signin")
  }

  const profileResult = await getRestaurantProfile()
  const settingsResult = await getRestaurantSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account & Settings</h1>
        <p className="text-gray-600">Manage your restaurant profile, settings, and business hours</p>
      </div>

      <AccountSettingsForm
        initialProfile={profileResult.profile}
        initialSettings={settingsResult.settings}
        userData={profileResult.user}
      />
    </div>
  )
}
