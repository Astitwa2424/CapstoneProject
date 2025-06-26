import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function SignInPage() {
  const session = await auth()

  // If user is already signed in, redirect to their dashboard
  if (session?.user) {
    const userRole = session.user.role.toLowerCase()
    redirect(`/${userRole}/dashboard`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Choose Your Role</CardTitle>
            <CardDescription>Select how you want to sign in to Food Hub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/customer/signin" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold">Customer</h3>
                <p className="text-sm text-gray-600">Order food from restaurants</p>
              </div>
            </Link>

            <Link href="/auth/driver/signin" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold">Food Hub Driver</h3>
                <p className="text-sm text-gray-600">Deliver food to customers</p>
              </div>
            </Link>

            <Link href="/auth/restaurant/signin" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold">Food Hub Restaurant</h3>
                <p className="text-sm text-gray-600">Manage your restaurant</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
