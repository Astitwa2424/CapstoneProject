"use client"

import { useState } from "react"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

// --- Zod Schemas for Validation ---

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

const signupBaseSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  phone: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
})

const restaurantSignupSchema = signupBaseSchema.extend({
  restaurantName: z.string().min(1, { message: "Restaurant name is required." }),
  streetAddress: z.string().min(1, { message: "Street address is required." }),
  suburb: z.string().min(1, { message: "Suburb is required." }),
  state: z.string().min(1, { message: "State is required." }),
  postcode: z.string().length(4, { message: "Postcode must be 4 digits." }),
  abn: z.string().length(11, { message: "ABN must be 11 digits." }),
  cuisine: z.string().min(1, { message: "Cuisine type is required." }),
  description: z.string().optional(),
  operatingHours: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  facebookUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  instagramUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
})

const customerSignupSchema = signupBaseSchema

const driverSignupSchema = signupBaseSchema.extend({
  // TODO: Add driver specific fields and validation here
})

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof restaurantSignupSchema>

const australianStates = [
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NSW", label: "New South Wales" },
  { value: "NT", label: "Northern Territory" },
  { value: "QLD", label: "Queensland" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "VIC", label: "Victoria" },
  { value: "WA", label: "Western Australia" },
]

const cuisineTypes = [
  "Australian",
  "Cafe",
  "Italian",
  "Chinese",
  "Japanese",
  "Thai",
  "Indian",
  "Mexican",
  "Greek",
  "Vietnamese",
  "Pizza",
  "Burgers",
  "Seafood",
  "Vegetarian",
  "Vegan",
  "Dessert",
]

interface AuthFormProps {
  userType: "customer" | "driver" | "restaurant"
}

export function AuthForm({ userType }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const getSignupSchema = () => {
    switch (userType) {
      case "restaurant":
        return restaurantSignupSchema
      case "driver":
        return driverSignupSchema
      case "customer":
      default:
        return customerSignupSchema
    }
  }

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    control: signupControl,
    formState: { errors: signupErrors },
  } = useForm<SignupValues>({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      terms: false,
      ...(userType === "restaurant"
        ? {
            restaurantName: "",
            streetAddress: "",
            suburb: "",
            state: "",
            postcode: "",
            abn: "",
            cuisine: "",
            description: "",
            operatingHours: "",
            bankName: "",
            bankAccountNumber: "",
            website: "",
            facebookUrl: "",
            instagramUrl: "",
          }
        : {}),
    },
  })

  const onLogin: SubmitHandler<LoginValues> = async (data) => {
    setIsLoading(true)
    const result = await signIn("credentials", { redirect: false, email: data.email, password: data.password })
    setIsLoading(false)
    if (result?.error) {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" })
    } else {
      toast({ title: "Login Successful", description: "Welcome back!" })
      router.push(`/${userType}/dashboard`)
      router.refresh()
    }
  }

  const onSignup: SubmitHandler<SignupValues> = async (data) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userType }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Something went wrong")
      toast({ title: "Signup Successful!", description: "You can now log in with your new account." })
      setActiveTab("login")
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsOAuthLoading(provider)
    try {
      // Set cookie for intended role if not customer
      if (userType !== "customer") {
        document.cookie = `oauth_intended_role=${userType.toUpperCase()}; path=/api/auth; SameSite=Lax; Secure`
      }

      await signIn(provider, {
        callbackUrl: `/${userType}/dashboard`,
        redirect: true,
      })
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "There was an error signing in with " + provider,
        variant: "destructive",
      })
      setIsOAuthLoading(null)
    }
  }

  const titles = { customer: "Customer Portal", driver: "Driver Portal", restaurant: "Restaurant Partner Portal" }
  const descriptions = {
    customer: "Order from the best local restaurants.",
    driver: "Start earning on your own schedule.",
    restaurant: "Grow your business with us.",
  }

  return (
    <Card className="w-full max-w-2xl my-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{titles[userType]}</CardTitle>
        <CardDescription>{descriptions[userType]}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <div className="space-y-4 pt-4">
              {/* OAuth buttons for customers only */}
              {userType === "customer" && (
                <>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleOAuthSignIn("google")}
                      disabled={isOAuthLoading !== null}
                    >
                      {isOAuthLoading === "google" ? (
                        "Signing in..."
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                          Continue with Google
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleOAuthSignIn("github")}
                      disabled={isOAuthLoading !== null}
                    >
                      {isOAuthLoading === "github" ? (
                        "Signing in..."
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          Continue with GitHub
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="m@example.com" {...registerLogin("email")} />
                  {loginErrors.email && <p className="text-sm text-red-600">{loginErrors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" {...registerLogin("password")} />
                  {loginErrors.password && <p className="text-sm text-red-600">{loginErrors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </div>
          </TabsContent>
          <TabsContent value="signup">
            <div className="space-y-6 pt-4">
              {/* OAuth buttons for customers only */}
              {userType === "customer" && (
                <>
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleOAuthSignIn("google")}
                      disabled={isOAuthLoading !== null}
                    >
                      {isOAuthLoading === "google" ? (
                        "Signing up..."
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                          Sign up with Google
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleOAuthSignIn("github")}
                      disabled={isOAuthLoading !== null}
                    >
                      {isOAuthLoading === "github" ? (
                        "Signing up..."
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          Sign up with GitHub
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-6">
                {/* Personal Details */}
                <fieldset className="space-y-4">
                  <legend className="text-lg font-semibold">Your Details</legend>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" {...registerSignup("firstName")} />
                      {signupErrors.firstName && (
                        <p className="text-sm text-red-600">{signupErrors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" {...registerSignup("lastName")} />
                      {signupErrors.lastName && <p className="text-sm text-red-600">{signupErrors.lastName.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" {...registerSignup("email")} />
                    {signupErrors.email && <p className="text-sm text-red-600">{signupErrors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" {...registerSignup("password")} />
                    {signupErrors.password && <p className="text-sm text-red-600">{signupErrors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" type="tel" placeholder="+61 4XX XXX XXX" {...registerSignup("phone")} />
                  </div>
                </fieldset>

                {userType === "restaurant" && (
                  <>
                    {/* Business Details */}
                    <fieldset className="space-y-4">
                      <legend className="text-lg font-semibold">Business Details</legend>
                      <div className="space-y-2">
                        <Label htmlFor="restaurantName">Restaurant Name</Label>
                        <Input id="restaurantName" {...registerSignup("restaurantName")} />
                        {signupErrors.restaurantName && (
                          <p className="text-sm text-red-600">{signupErrors.restaurantName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="abn">ABN (Australian Business Number)</Label>
                        <Input id="abn" {...registerSignup("abn")} />
                        {signupErrors.abn && <p className="text-sm text-red-600">{signupErrors.abn.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cuisine">Cuisine Type</Label>
                        <Controller
                          control={signupControl}
                          name="cuisine"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger id="cuisine">
                                <SelectValue placeholder="Select Cuisine" />
                              </SelectTrigger>
                              <SelectContent>
                                {cuisineTypes.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {signupErrors.cuisine && <p className="text-sm text-red-600">{signupErrors.cuisine.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="A short, catchy description of your restaurant."
                          {...registerSignup("description")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operatingHours">Operating Hours (Optional)</Label>
                        <Input
                          id="operatingHours"
                          placeholder="e.g., Mon-Fri 9am-10pm, Sat-Sun 11am-11pm"
                          {...registerSignup("operatingHours")}
                        />
                      </div>
                    </fieldset>

                    {/* Location Details */}
                    <fieldset className="space-y-4">
                      <legend className="text-lg font-semibold">Location</legend>
                      <div className="space-y-2">
                        <Label htmlFor="streetAddress">Street Address</Label>
                        <Input id="streetAddress" {...registerSignup("streetAddress")} />
                        {signupErrors.streetAddress && (
                          <p className="text-sm text-red-600">{signupErrors.streetAddress.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="suburb">Suburb</Label>
                          <Input id="suburb" {...registerSignup("suburb")} />
                          {signupErrors.suburb && <p className="text-sm text-red-600">{signupErrors.suburb.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postcode">Postcode</Label>
                          <Input id="postcode" {...registerSignup("postcode")} />
                          {signupErrors.postcode && (
                            <p className="text-sm text-red-600">{signupErrors.postcode.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Territory</Label>
                        <Controller
                          control={signupControl}
                          name="state"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger id="state">
                                <SelectValue placeholder="Select State/Territory" />
                              </SelectTrigger>
                              <SelectContent>
                                {australianStates.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {signupErrors.state && <p className="text-sm text-red-600">{signupErrors.state.message}</p>}
                      </div>
                    </fieldset>

                    {/* Financial Details */}
                    <fieldset className="space-y-4">
                      <legend className="text-lg font-semibold">Financial Details (Optional)</legend>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" placeholder="e.g., Commonwealth Bank" {...registerSignup("bankName")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankAccountNumber">Account Number</Label>
                        <Input id="bankAccountNumber" {...registerSignup("bankAccountNumber")} />
                      </div>
                    </fieldset>

                    {/* Online Presence */}
                    <fieldset className="space-y-4">
                      <legend className="text-lg font-semibold">Online Presence (Optional)</legend>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://your-restaurant.com.au"
                          {...registerSignup("website")}
                        />
                        {signupErrors.website && <p className="text-sm text-red-600">{signupErrors.website.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebookUrl">Facebook URL</Label>
                        <Input
                          id="facebookUrl"
                          type="url"
                          placeholder="https://facebook.com/your-restaurant"
                          {...registerSignup("facebookUrl")}
                        />
                        {signupErrors.facebookUrl && (
                          <p className="text-sm text-red-600">{signupErrors.facebookUrl.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagramUrl">Instagram URL</Label>
                        <Input
                          id="instagramUrl"
                          type="url"
                          placeholder="https://instagram.com/your-restaurant"
                          {...registerSignup("instagramUrl")}
                        />
                        {signupErrors.instagramUrl && (
                          <p className="text-sm text-red-600">{signupErrors.instagramUrl.message}</p>
                        )}
                      </div>
                    </fieldset>
                  </>
                )}

                {/* Terms and Conditions */}
                <div className="pt-2">
                  <Controller
                    name="terms"
                    control={signupControl}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-400"
                        />
                        <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
                          I agree to the{" "}
                          <Link href="/terms" className="underline hover:text-blue-600">
                            Terms and Conditions
                          </Link>
                        </Label>
                      </div>
                    )}
                  />
                  {signupErrors.terms && <p className="text-sm text-red-600 mt-2">{signupErrors.terms.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
