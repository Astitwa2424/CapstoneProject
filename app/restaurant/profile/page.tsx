import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getRestaurantProfile } from "./actions"
import { RestaurantProfileForm } from "@/components/restaurant/restaurant-profile-form"

export default async function RestaurantProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/restaurant/signin")
  }

  if (session.user.role !== "RESTAURANT") {
    redirect("/unauthorized")
  }

  const profileResult = await getRestaurantProfile()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Restaurant Profile</h1>
          <p className="text-gray-600 mt-2">
            Update your restaurant information. Changes will be immediately visible to customers.
          </p>
        </div>

        <RestaurantProfileForm initialData={profileResult.profile} />
      </div>
    </div>
  )
}
