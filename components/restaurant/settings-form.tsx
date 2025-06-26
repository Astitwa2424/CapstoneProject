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
import { updateRestaurantSettings } from "@/app/restaurant/settings/actions"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Store, Clock, Truck, Bell, CreditCard, Shield, Phone, MapPin, Loader2, SettingsIcon } from "lucide-react"

const settingsSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
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
  maxOrdersPerHour: z.number().min(1).max(100).default(20),

  // Notification Settings
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  orderNotifications: z.boolean().default(true),
  promotionalEmails: z.boolean().default(false),

  // Payment Settings
  acceptCashOnDelivery: z.boolean().default(true),
  acceptCardPayments: z.boolean().default(true),

  // Security Settings
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeout: z.number().min(5).max(120).default(30),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface SettingsFormProps {
  initialData?: any
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [operatingHours, setOperatingHours] = useState(
    initialData?.operatingHours || {
      monday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      tuesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      wednesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      thursday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      friday: { isOpen: true, openTime: "09:00", closeTime: "23:00" },
      saturday: { isOpen: true, openTime: "09:00", closeTime: "23:00" },
      sunday: { isOpen: true, openTime: "10:00", closeTime: "21:00" },
    },
  )

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData || {},
  })

  const handleSubmit = async (data: SettingsFormData) => {
    // Add operating hours to form data
    Object.keys(operatingHours).forEach((day) => {
      data[`${day}Enabled`] = operatingHours[day].isOpen
      data[`${day}Open`] = operatingHours[day].openTime
      data[`${day}Close`] = operatingHours[day].closeTime
    })

    startTransition(async () => {
      const result = await updateRestaurantSettings(data)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const updateOperatingHours = (day: string, field: string, value: any) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Restaurant Settings</h2>
            <p className="text-gray-600">Configure your restaurant preferences and operations</p>
          </div>
          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4" />
                Saving Settings...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">
              <Store className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-2" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="delivery">
              <Truck className="h-4 w-4 mr-2" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="restaurantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          <Input {...field} />
                        </FormControl>
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
                        <Textarea {...field} placeholder="Tell customers about your restaurant..." />
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
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Restaurant Status</FormLabel>
                        <FormDescription>Toggle your restaurant open/closed status</FormDescription>
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Accept Online Orders</FormLabel>
                    <FormDescription>Allow customers to place orders online</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      name="acceptsOnlineOrders"
                      defaultChecked={true}
                      {...form.register("acceptsOnlineOrders")}
                    />
                  </FormControl>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Accept Reservations</FormLabel>
                    <FormDescription>Allow customers to make table reservations</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      name="acceptsReservations"
                      defaultChecked={false}
                      {...form.register("acceptsReservations")}
                    />
                  </FormControl>
                </div>
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
                <CardDescription>Set your restaurant's operating hours for each day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <Label className="font-medium">{day.label}</Label>
                    </div>
                    <FormField
                      control={form.control}
                      name={`${day.key}Enabled` as keyof SettingsFormData}
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
                        name={`${day.key}Open` as keyof SettingsFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={!form.watch(`${day.key}Enabled` as keyof SettingsFormData)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span>to</span>
                      <FormField
                        control={form.control}
                        name={`${day.key}Close` as keyof SettingsFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                disabled={!form.watch(`${day.key}Enabled` as keyof SettingsFormData)}
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
                  <Truck className="h-5 w-5" />
                  Delivery Settings
                </CardTitle>
                <CardDescription>Configure delivery options and pricing</CardDescription>
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
                  <FormField
                    control={form.control}
                    name="maxOrdersPerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Orders Per Hour</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormDescription>Maximum number of orders per hour</FormDescription>
                        <FormMessage />
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
                        <FormDescription>Get notified about new orders</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="promotionalEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Promotional Emails</FormLabel>
                        <FormDescription>Receive marketing and promotional emails</FormDescription>
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

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Configure accepted payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Integration</h3>
                  <p className="text-gray-500 mb-4">Connect your payment processor to accept online payments</p>
                  <Button variant="outline">Configure Payment Methods</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="twoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Two-Factor Authentication</FormLabel>
                        <FormDescription>Add an extra layer of security to your account</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Timeout (minutes)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>Automatically log out after this period of inactivity</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Password Management</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Keep your account secure by regularly updating your password
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}
