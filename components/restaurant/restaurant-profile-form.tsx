"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { upsertRestaurantProfile } from "@/app/restaurant/profile/actions"
import { Loader2 } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Restaurant name must be at least 2 characters." }),
  description: z.string().optional(),
  phone: z.string().min(5, { message: "Phone number is required." }),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),

  // Address
  streetAddress: z.string().min(5, { message: "Street address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Business details
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),

  // Social media
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),

  // Operating hours - stored as JSON
  operatingHours: z.string().optional(),

  // Bank details
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  swiftCode: z.string().optional(),

  // Map location
  mapLatitude: z.string().optional(),
  mapLongitude: z.string().optional(),
})

// Define the props
interface RestaurantProfileFormProps {
  initialData?: any
}

export function RestaurantProfileForm({ initialData }: RestaurantProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default operating hours structure
  const defaultOperatingHours = {
    monday: { open: "09:00", close: "22:00", isClosed: false },
    tuesday: { open: "09:00", close: "22:00", isClosed: false },
    wednesday: { open: "09:00", close: "22:00", isClosed: false },
    thursday: { open: "09:00", close: "22:00", isClosed: false },
    friday: { open: "09:00", close: "22:00", isClosed: false },
    saturday: { open: "09:00", close: "22:00", isClosed: false },
    sunday: { open: "09:00", close: "22:00", isClosed: false },
  }

  // Parse operating hours from JSON if available
  let parsedOperatingHours = defaultOperatingHours
  try {
    if (initialData?.operatingHours) {
      parsedOperatingHours =
        typeof initialData.operatingHours === "string"
          ? JSON.parse(initialData.operatingHours)
          : initialData.operatingHours
    }
  } catch (e) {
    console.error("Error parsing operating hours:", e)
  }

  // Initialize form with default values or existing data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      website: initialData?.website || "",
      category: initialData?.category || "",

      streetAddress: initialData?.streetAddress || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      country: initialData?.country || "",

      businessRegistrationNumber: initialData?.businessRegistrationNumber || "",
      taxId: initialData?.taxId || "",

      facebookUrl: initialData?.facebookUrl || "",
      instagramUrl: initialData?.instagramUrl || "",
      twitterUrl: initialData?.twitterUrl || "",

      operatingHours: JSON.stringify(parsedOperatingHours, null, 2),

      bankAccountNumber: initialData?.bankAccountNumber || "",
      bankName: initialData?.bankName || "",
      swiftCode: initialData?.swiftCode || "",

      mapLatitude: initialData?.mapLatitude?.toString() || "",
      mapLongitude: initialData?.mapLongitude?.toString() || "",
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Create FormData object
      const formData = new FormData()

      // Append all form values
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value)
        }
      })

      // Submit the form
      const result = await upsertRestaurantProfile(formData)

      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your restaurant profile has been updated successfully.",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      console.error("Profile update error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter your restaurant's profile and business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Restaurant Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessRegistrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Registration</FormLabel>
                  <FormControl>
                    <Input placeholder="Business Registration Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Tax ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Fine Dining">Fine Dining</SelectItem>
                      <SelectItem value="Casual Dining">Casual Dining</SelectItem>
                      <SelectItem value="Fast Food">Fast Food</SelectItem>
                      <SelectItem value="Cafe">Cafe</SelectItem>
                      <SelectItem value="Bistro">Bistro</SelectItem>
                      <SelectItem value="Buffet">Buffet</SelectItem>
                      <SelectItem value="Food Truck">Food Truck</SelectItem>
                      <SelectItem value="Pub">Pub</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell customers about your restaurant..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How customers can reach your restaurant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@yourrestaurant.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.yourrestaurant.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-sm font-medium mb-2">Social Media</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/yourrestaurant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/yourrestaurant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/yourrestaurant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Your restaurant's physical address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Example Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Map Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mapLatitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 40.7128" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mapLongitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. -74.0060" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4 bg-muted h-[200px] rounded-md flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Map preview will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>Set your restaurant's opening and closing times</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="operatingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Hours (JSON format)</FormLabel>
                  <FormControl>
                    <Textarea className="font-mono text-xs h-[300px]" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your operating hours in JSON format. Example:{" "}
                    {`{"monday": {"open": "09:00", "close": "22:00", "isClosed": false}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Your bank details for receiving payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank Account Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bank Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="swiftCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Swift Code</FormLabel>
                  <FormControl>
                    <Input placeholder="SWIFT/BIC Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
