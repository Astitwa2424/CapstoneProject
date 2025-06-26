"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { updateRestaurantProfile } from "@/app/restaurant/profile/actions"
import { updateRestaurantSettings } from "@/app/restaurant/settings/actions"
import {
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Save,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Bell,
  Store,
} from "lucide-react"

const accountSchema = z.object({
  // Profile Information
  restaurantName: z.string().min(1, "Restaurant name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),

  // Location
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Business Settings
  isOpen: z.boolean().default(true),
  acceptsOnlineOrders: z.boolean().default(true),
  acceptsReservations: z.boolean().default(false),

  // Operating Hours
  mondayEnabled: z.boolean().default(true),
  mondayOpen: z.string().default("09:00"),
  mondayClose: z.string().default("22:00"),
  tuesdayEnabled: z.boolean().default(true),
  tuesdayOpen: z.string().default("09:00"),
  tuesdayClose: z.string().default("22:00"),
  wednesdayEnabled: z.boolean().default(true),
  wednesdayOpen: z.string().default("09:00"),
  wednesdayClose: z.string().default("22:00"),
  thursdayEnabled: z.boolean().default(true),
  thursdayOpen: z.string().default("09:00"),
  thursdayClose: z.string().default("22:00"),
  fridayEnabled: z.boolean().default(true),
  fridayOpen: z.string().default("09:00"),
  fridayClose: z.string().default("23:00"),
  saturdayEnabled: z.boolean().default(true),
  saturdayOpen: z.string().default("09:00"),
  saturdayClose: z.string().default("23:00"),
  sundayEnabled: z.boolean().default(true),
  sundayOpen: z.string().default("10:00"),
  sundayClose: z.string().default("21:00"),

  // Delivery Settings
  deliveryRadius: z.number().min(1).max(50).default(5),
  deliveryFee: z.number().min(0).default(0),
  minOrderAmount: z.number().min(0).default(0),
  estimatedDeliveryTime: z.number().min(10).max(120).default(30),

  // Notifications
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  orderNotifications: z.boolean().default(true),

  // Payment
  acceptCashOnDelivery: z.boolean().default(true),
  acceptCardPayments: z.boolean().default(true),
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountSettingsFormProps {
  initialProfile?: any
  initialSettings?: any
  userData?: any
}

export function AccountSettingsForm({ initialProfile, initialSettings, userData }: AccountSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("profile")

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      restaurantName: initialProfile?.name || "",
      email: userData?.email || "",
      phone: initialProfile?.phone || "",
      description: initialProfile?.description || "",
      category: initialProfile?.category || "",
      website: initialProfile?.website || "",
      facebookUrl: initialProfile?.facebookUrl || "",
      instagramUrl: initialProfile?.instagramUrl || "",
      twitterUrl: initialProfile?.twitterUrl || "",
      streetAddress: initialProfile?.streetAddress || "",
      city: initialProfile?.city || "",
      state: initialProfile?.state || "",
      postalCode: initialProfile?.postalCode || "",
      country: initialProfile?.country || "",
      isOpen: initialProfile?.isOpen ?? true,
      acceptsOnlineOrders: initialSettings?.acceptsOnlineOrders ?? true,
      acceptsReservations: initialSettings?.acceptsReservations ?? false,
      deliveryRadius: initialSettings?.deliveryRadius || 5,
      deliveryFee: initialSettings?.deliveryFee || 0,
      minOrderAmount: initialSettings?.minOrderAmount || 0,
      estimatedDeliveryTime: initialSettings?.estimatedDeliveryTime || 30,
      emailNotifications: initialSettings?.emailNotifications ?? true,
      smsNotifications: initialSettings?.smsNotifications ?? false,
      orderNotifications: initialSettings?.orderNotifications ?? true,
      acceptCashOnDelivery: initialSettings?.acceptCashOnDelivery ?? true,
      acceptCardPayments: initialSettings?.acceptCardPayments ?? true,
      // Operating hours defaults
      mondayEnabled: true,
      mondayOpen: "09:00",
      mondayClose: "22:00",
      tuesdayEnabled: true,
      tuesdayOpen: "09:00",
      tuesdayClose: "22:00",
      wednesdayEnabled: true,
      wednesdayOpen: "09:00",
      wednesdayClose: "22:00",
      thursdayEnabled: true,
      thursdayOpen: "09:00",
      thursdayClose: "22:00",
      fridayEnabled: true,
      fridayOpen: "09:00",
      fridayClose: "23:00",
      saturdayEnabled: true,
      saturdayOpen: "09:00",
      saturdayClose: "23:00",
      sundayEnabled: true,
      sundayOpen: "10:00",
      sundayClose: "21:00",
    },
  })

  const onSubmit = async (data: AccountFormData) => {
    startTransition(async () => {
      try {
        // Update profile
        const profileResult = await updateRestaurantProfile({
          name: data.restaurantName,
          email: data.email,
          phone: data.phone,
          description: data.description,
          category: data.category,
          website: data.website,
          facebookUrl: data.facebookUrl,
          instagramUrl: data.instagramUrl,
          twitterUrl: data.twitterUrl,
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        })

        // Update settings
        const settingsResult = await updateRestaurantSettings(data)

        if (profileResult.success && settingsResult.success) {
          toast.success("Account and settings updated successfully!")
        } else {
          toast.error("Some updates failed. Please try again.")
        }
      } catch (error) {
        toast.error("An error occurred while updating your information.")
      }
    })
  }

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={form.watch("isOpen") ? "default" : "secondary"}
              className={form.watch("isOpen") ? "bg-green-600" : ""}
            >
              {form.watch("isOpen") ? "Restaurant Open" : "Restaurant Closed"}
            </Badge>
          </div>
          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="business">
              <Store className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-2" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="delivery">
              <MapPin className="h-4 w-4 mr-2" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Restaurant Information
                </CardTitle>
                <CardDescription>Basic information about your restaurant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="restaurantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your Restaurant Name" />
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
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contact@restaurant.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1 (555) 123-4567" />
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
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fast-food">Fast Food</SelectItem>
                            <SelectItem value="casual-dining">Casual Dining</SelectItem>
                            <SelectItem value="fine-dining">Fine Dining</SelectItem>
                            <SelectItem value="cafe">Cafe</SelectItem>
                            <SelectItem value="bakery">Bakery</SelectItem>
                            <SelectItem value="food-truck">Food Truck</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Tell customers about your restaurant..." rows={3} />
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
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.yourrestaurant.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label>Social Media</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Facebook className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                              <Input {...field} placeholder="Facebook URL" className="pl-10" />
                            </div>
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
                          <FormControl>
                            <div className="relative">
                              <Instagram className="absolute left-3 top-3 h-4 w-4 text-pink-600" />
                              <Input {...field} placeholder="Instagram URL" className="pl-10" />
                            </div>
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
                          <FormControl>
                            <div className="relative">
                              <Twitter className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                              <Input {...field} placeholder="Twitter URL" className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
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
                        <Input {...field} placeholder="123 Restaurant Street" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Sydney" />
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
                          <Input {...field} placeholder="NSW" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="2000" />
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
                          <Input {...field} placeholder="Australia" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Business Settings
                </CardTitle>
                <CardDescription>Configure your restaurant's operational settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Restaurant Status</FormLabel>
                        <FormDescription>
                          Toggle your restaurant open/closed status. This affects order acceptance.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          <Badge
                            variant={field.value ? "default" : "secondary"}
                            className={field.value ? "bg-green-600" : ""}
                          >
                            {field.value ? "Open" : "Closed"}
                          </Badge>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptsOnlineOrders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Accept Online Orders</FormLabel>
                        <FormDescription>Allow customers to place orders through the platform</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptsReservations"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Accept Reservations</FormLabel>
                        <FormDescription>Allow customers to make table reservations</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
                <CardDescription>
                  Set your restaurant's operating hours. Orders will only be accepted during these times.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <Label className="font-medium">{day.label}</Label>
                    </div>
                    <FormField
                      control={form.control}
                      name={`${day.key}Enabled` as keyof AccountFormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`${day.key}Open` as keyof AccountFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={!form.watch(`${day.key}Enabled` as keyof AccountFormData)}
                                className="w-32"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="text-gray-500">to</span>
                      <FormField
                        control={form.control}
                        name={`${day.key}Close` as keyof AccountFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={!form.watch(`${day.key}Enabled` as keyof AccountFormData)}
                                className="w-32"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Settings
                </CardTitle>
                <CardDescription>Configure your delivery options and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Radius (km)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormDescription>Maximum distance for delivery</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Standard delivery charge</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Minimum order amount for delivery</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedDeliveryTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Delivery Time (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormDescription>Average delivery time</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Payment Methods</h4>
                  <FormField
                    control={form.control}
                    name="acceptCashOnDelivery"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Cash on Delivery</FormLabel>
                          <FormDescription>Accept cash payments upon delivery</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acceptCardPayments"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Card Payments</FormLabel>
                          <FormDescription>Accept credit/debit card payments online</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>Receive order notifications via email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>SMS Notifications</FormLabel>
                        <FormDescription>Receive urgent notifications via SMS</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Order Notifications</FormLabel>
                        <FormDescription>Get notified about new orders immediately</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
