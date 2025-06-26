"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Github, Mail, Phone, MapPin, User, Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"

interface AuthFormProps {
  userType: "customer" | "driver" | "restaurant"
  callbackUrl?: string
}

export function AuthForm({ userType, callbackUrl }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    // Driver specific
    licenseNumber: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleYear: "",
    plateNumber: "",
    insuranceProvider: "",
    // Restaurant specific
    restaurantName: "",
    businessType: "",
    cuisine: "",
    description: "",
    businessLicense: "",
    taxId: "",
  })

  const titles = {
    customer: "Welcome to Food Hub",
    driver: "Drive with Food Hub",
    restaurant: "Partner with Food Hub",
  }

  const descriptions = {
    customer: "Sign in to order delicious food from your favorite restaurants",
    driver: "Join our driver community and start earning money today",
    restaurant: "Grow your business by reaching more customers",
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("") // Clear error when user types
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError("")
    document.cookie = `oauth_intended_role=${userType}; path=/api/auth; SameSite=Lax; max-age=300; Secure`

    // Let NextAuth handle the redirect by removing redirect: false
    await signIn(provider, {
      callbackUrl: callbackUrl || `/${userType}/dashboard`,
    })
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      callbackUrl: `/${userType}/dashboard`, // Specify callbackUrl here
    })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    console.log("📝 Attempting signup for:", formData.email)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userType,
        }),
      })

      const data = await response.json()
      console.log("📝 Signup response:", data)

      if (response.ok) {
        console.log("✅ Signup successful")
        setSignupSuccess(true)
        // Auto sign in after successful signup
        setTimeout(async () => {
          console.log("🔐 Auto-signing in after signup...")
          const signInResult = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            callbackUrl: `/${userType}/dashboard`,
          })

          if (signInResult?.ok) {
            window.location.href = `/${userType}/dashboard`
          } else {
            console.error("❌ Auto sign-in failed:", signInResult?.error)
            // Redirect to sign in page if auto sign-in fails
            window.location.href = `/auth/${userType}/signin`
          }
        }, 2000)
      } else {
        console.error("❌ Signup failed:", data.error)
        setError(data.error || "Failed to create account. Please try again.")
      }
    } catch (error) {
      console.error("💥 Signup error:", error)
      setError("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Here you would call your forgot password API
      console.log("Forgot password for:", formData.email)
      alert("Password reset code sent to your email/phone!")
      setShowForgotPassword(false)
    } catch (error) {
      console.error("Forgot password error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Account Created!</CardTitle>
          <CardDescription>Welcome to Food Hub! Youre being redirected to your dashboard...</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  if (showForgotPassword) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription>Enter your email to receive a reset code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
              Back to Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-0">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          {titles[userType]}
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">{descriptions[userType]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                !isSignUp ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                isSignUp ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setIsSignUp(true)}
            >
              Sign Up
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!isSignUp ? (
          // Sign In Form
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            {userType === "customer" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    variant="outline"
                    className="h-12"
                    disabled={isLoading}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn("github")}
                    variant="outline"
                    className="h-12"
                    disabled={isLoading}
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </form>
        ) : (
          // Sign Up Form (keeping the existing signup form code)
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    placeholder="First name"
                    className="pl-10 h-12"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  className="h-12"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="pl-10 h-12"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    className="pl-10 pr-10 h-12"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  className="h-12"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  placeholder="Enter your address"
                  className="pl-10 h-12"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  className="h-12"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="ZIP"
                  className="h-12"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Driver-specific fields */}
            {userType === "driver" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Driver Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Drivers License Number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="License number"
                        className="h-12"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleType">Vehicle Type</Label>
                        <Select onValueChange={(value) => handleInputChange("vehicleType", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="bike">Bike</SelectItem>
                            <SelectItem value="scooter">Scooter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Vehicle Model</Label>
                        <Input
                          id="vehicleModel"
                          placeholder="e.g., Honda Civic"
                          className="h-12"
                          value={formData.vehicleModel}
                          onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Vehicle Year</Label>
                        <Input
                          id="vehicleYear"
                          placeholder="e.g., 2020"
                          className="h-12"
                          value={formData.vehicleYear}
                          onChange={(e) => handleInputChange("vehicleYear", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plateNumber">License Plate</Label>
                        <Input
                          id="plateNumber"
                          placeholder="Plate number"
                          className="h-12"
                          value={formData.plateNumber}
                          onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Input
                        id="insuranceProvider"
                        placeholder="Insurance company name"
                        className="h-12"
                        value={formData.insuranceProvider}
                        onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Restaurant-specific fields */}
            {userType === "restaurant" && (
              <>
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Restaurant Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName">Restaurant Name</Label>
                      <Input
                        id="restaurantName"
                        placeholder="Your restaurant name"
                        className="h-12"
                        value={formData.restaurantName}
                        onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select onValueChange={(value) => handleInputChange("businessType", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="cafe">Cafe</SelectItem>
                            <SelectItem value="bakery">Bakery</SelectItem>
                            <SelectItem value="food-truck">Food Truck</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cuisine">Cuisine Type</Label>
                        <Input
                          id="cuisine"
                          placeholder="e.g., Italian, Chinese"
                          className="h-12"
                          value={formData.cuisine}
                          onChange={(e) => handleInputChange("cuisine", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Restaurant Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your restaurant..."
                        className="min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessLicense">Business License Number</Label>
                        <Input
                          id="businessLicense"
                          placeholder="License number"
                          className="h-12"
                          value={formData.businessLicense}
                          onChange={(e) => handleInputChange("businessLicense", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                          id="taxId"
                          placeholder="Tax identification number"
                          className="h-12"
                          value={formData.taxId}
                          onChange={(e) => handleInputChange("taxId", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-orange-600 hover:text-orange-700">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {userType === "customer" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    variant="outline"
                    className="h-12"
                    disabled={isLoading}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleOAuthSignIn("github")}
                    variant="outline"
                    className="h-12"
                    disabled={isLoading}
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
