"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateRestaurantSettings } from "@/app/restaurant/settings/actions"
import type { RestaurantProfile } from "@prisma/client"
import { Loader2 } from "lucide-react"

const settingsFormSchema = z.object({
  name: z.string().min(2, { message: "Restaurant name must be at least 2 characters." }),
  description: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  cuisine: z.string().optional(),
  isOpen: z.boolean(),
  deliveryFee: z.coerce.number().min(0).optional(),
  minOrder: z.coerce.number().min(0).optional(),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

interface SettingsFormProps {
  initialData: RestaurantProfile
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: initialData.name || "",
      description: initialData.description || "",
      streetAddress: initialData.streetAddress || "",
      city: initialData.city || "",
      state: initialData.state || "",
      postalCode: initialData.postalCode || "",
      phone: initialData.phone || "",
      cuisine: Array.isArray(initialData.cuisine) ? initialData.cuisine.join(", ") : "",
      isOpen: initialData.isOpen || true,
      deliveryFee: initialData.deliveryFee || 0,
      minOrder: initialData.minOrder || 0,
    },
  })

  async function onSubmit(data: SettingsFormValues) {
    toast.info("Updating settings...")
    const result = await updateRestaurantSettings(data)
    if (result.success) {
      toast.success("Restaurant settings updated successfully!")
    } else {
      toast.error(result.error || "Failed to update settings.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Restaurant's Name" {...field} />
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
                <Textarea placeholder="Tell customers about your restaurant" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cuisine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuisine Types</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Italian, Pizza, Pasta" {...field} />
              </FormControl>
              <FormDescription>Separate different cuisine types with a comma.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="deliveryFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Fee ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="5.00" {...field} />
                </FormControl>
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
                  <Input type="number" step="0.01" placeholder="10.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="isOpen"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Open for Orders</FormLabel>
                <FormDescription>
                  Turn this off to temporarily stop accepting new orders from customers.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Settings
        </Button>
      </form>
    </Form>
  )
}
