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
import { updateRestaurantProfile } from "@/app/restaurant/profile/actions"
import { Loader2 } from "lucide-react"
import { LogoImageUpload } from "@/components/ui/logo-image-upload"

const formSchema = z.object({
  name: z.string().min(2, { message: "Restaurant name must be at least 2 characters." }),
  description: z.string().optional(),
  phone: z.string().min(5, { message: "Phone number is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  cuisine: z.string().min(1, { message: "Please select a cuisine type." }),
  category: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  deliveryFee: z.string().optional(),
  minOrder: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankName: z.string().optional(),
  swiftCode: z.string().optional(),
  logoImage: z.string().optional(),
})

interface RestaurantProfileFormProps {
  initialData?: any
}

export function RestaurantProfileForm({ initialData }: RestaurantProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      phone: initialData?.phone || "",
      address: initialData?.streetAddress || initialData?.address || "",
      cuisine: Array.isArray(initialData?.cuisine) ? initialData.cuisine[0] : initialData?.cuisine || "",
      category: initialData?.category || "",
      website: initialData?.website || "",
      deliveryFee: initialData?.deliveryFee?.toString() || "2.99",
      minOrder: initialData?.minOrder?.toString() || "15.00",
      businessRegistrationNumber: initialData?.businessRegistrationNumber || "",
      taxId: initialData?.taxId || "",
      bankAccountNumber: initialData?.bankAccountNumber || "",
      bankName: initialData?.bankName || "",
      swiftCode: initialData?.swiftCode || "",
      logoImage: initialData?.logoImage || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      console.log("Form values:", values)

      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString())
        }
      })

      console.log("FormData entries:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }

      const result = await updateRestaurantProfile(formData)
      console.log("Update result:", result)

      if (result.success) {
        toast.success("Profile updated successfully! Changes will be visible to customers.")
        router.refresh()
      } else {
        console.error("Update failed:", result.error, result.issues)
        toast.error(result.error || "Failed to update profile. Please try again.")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error("An unexpected error occurred. Please try again.")
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
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>This information will be visible to customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Restaurant Name" {...field} />
                  </FormControl>
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
                  <FormDescription>This description will appear on your restaurant page</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cuisine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisine Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="Mexican">Mexican</SelectItem>
                        <SelectItem value="Indian">Indian</SelectItem>
                        <SelectItem value="American">American</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Thai">Thai</SelectItem>
                        <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fine Dining">Fine Dining</SelectItem>
                        <SelectItem value="Casual Dining">Casual Dining</SelectItem>
                        <SelectItem value="Fast Food">Fast Food</SelectItem>
                        <SelectItem value="Cafe">Cafe</SelectItem>
                        <SelectItem value="Bistro">Bistro</SelectItem>
                        <SelectItem value="Food Truck">Food Truck</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Logo</CardTitle>
            <CardDescription>Upload a logo for your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="logoImage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LogoImageUpload
                      value={field.value}
                      onChange={(fileUrl: string) => {
                        console.log("Logo image changed:", fileUrl)
                        field.onChange(fileUrl)
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Location</CardTitle>
            <CardDescription>How customers can find and contact you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, City, State 12345" {...field} />
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
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.yourrestaurant.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Settings</CardTitle>
            <CardDescription>Configure your delivery options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Fee ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="2.99" {...field} />
                    </FormControl>
                    <FormDescription>Set to 0 for free delivery</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="15.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Business registration and payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
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
                      <Input placeholder="12-3456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
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
                      <Input placeholder="Bank of America" {...field} />
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
                    <FormLabel>SWIFT Code</FormLabel>
                    <FormControl>
                      <Input placeholder="BOFAUS3N" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
