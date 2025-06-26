import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth/auth-form"

export default async function CustomerSignInPage() {
  const session = await auth()

  // If user is already signed in, redirect to appropriate dashboard
  if (session?.user) {
    const userRole = session.user.role.toLowerCase()
    redirect(`/${userRole}/dashboard`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthForm userType="customer" />
    </div>
  )
}
