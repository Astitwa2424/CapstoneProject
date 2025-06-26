import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in."
      case "Verification":
        return "The verification token has expired or has already been used."
      case "OAuthSignin":
        return "Error in constructing an authorization URL."
      case "OAuthCallback":
        return "Error in handling the response from an OAuth provider."
      case "OAuthCreateAccount":
        return "Could not create OAuth account in the database."
      case "EmailCreateAccount":
        return "Could not create email account in the database."
      case "Callback":
        return "Error in the OAuth callback handler route."
      case "OAuthAccountNotLinked":
        return "Email on the account is already linked, but not with this OAuth account."
      case "EmailSignin":
        return "Sending the e-mail with the verification token failed."
      case "CredentialsSignin":
        return "The authorize callback returned null in the Credentials provider."
      case "SessionRequired":
        return "The content of this page requires you to be signed in at all times."
      default:
        return "An unknown error occurred during authentication."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription>{error ? getErrorMessage(error) : "An error occurred during sign in."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Error Code:</strong> {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
