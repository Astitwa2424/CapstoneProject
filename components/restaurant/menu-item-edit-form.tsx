"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { createMenuItem, updateMenuItem } from "@/app/restaurant/actions"
import type { MenuItem } from "@prisma/client"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
})

interface MenuItemFormProps {
  initialData?: MenuItem
}

export function MenuItemForm({ initialData }: MenuItemFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: Number(initialData.price),
        }
      : {
          name: "",
          description: "",
          price: 0,
          imageUrl: "",
          isAvailable: true,
        },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const action = initialData ? updateMenuItem(initialData.id, values) : createMenuItem(values)

      const result = await action

      if (result.success) {
        toast({
          title: `Success!`,
          description: `Menu item ${initialData ? "updated" : "created"} successfully.`,
        })
        router.push("/restaurant/dashboard/menu")
        router.refresh()
      } else {
        toast({
          variant: "destructive",
          title: "An error occurred.",
          description: result.error || "Unable to save menu item.",
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Classic Cheeseburger" {...field} />
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
                <Textarea placeholder="Describe the menu item..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g. 12.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>Link to an image of the menu item.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Availability</FormLabel>
                <FormDescription>Is this item currently available for customers to order?</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex space-x-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? (initialData ? "Saving..." : "Creating...") : initialData ? "Save Changes" : "Create Item"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/restaurant/dashboard/menu")}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
