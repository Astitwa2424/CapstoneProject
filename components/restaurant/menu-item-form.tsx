"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMenuItem, updateMenuItem } from "@/app/restaurant/actions"
import { Loader2, Save } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import type { MenuItem } from "@prisma/client"
import { toast } from "sonner"

interface MenuItemFormProps {
  initialData?: MenuItem | null
}

export function MenuItemForm({ initialData }: MenuItemFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    category: initialData?.category || "",
    allergens: Array.isArray(initialData?.allergens) ? initialData.allergens.join(", ") : initialData?.allergens || "",
    image: initialData?.image || "",
    spicyLevel: initialData?.spicyLevel || 0,
    isVegetarian: initialData?.isVegetarian || false,
    isVegan: initialData?.isVegan || false,
    isGlutenFree: initialData?.isGlutenFree || false,
    isActive: initialData?.isActive ?? true,
  })

  const handleInputChange = (field: string, value: string | number | boolean) =>
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Item name is required")
      return
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }

    startTransition(async () => {
      const menuItemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        allergens: formData.allergens,
        image: formData.image,
        spicyLevel: Number(formData.spicyLevel),
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        isActive: formData.isActive,
      }

      let result
      if (initialData) {
        result = await updateMenuItem(initialData.id, menuItemData)
      } else {
        result = await createMenuItem(menuItemData)
      }

      if (result.success) {
        toast.success(`Menu item ${initialData ? "updated" : "created"} successfully`)
        router.push("/restaurant/dashboard/menu")
        router.refresh() // Ensures the list is updated
      } else {
        toast.error(result.error || `Failed to ${initialData ? "update" : "create"} menu item`)
      }
    })
  }

  const categories = ["Appetizers", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Sides", "Specials"]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Margherita Pizza"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your menu item..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="spicyLevel">Spicy Level (0-5)</Label>
          <Input
            id="spicyLevel"
            type="number"
            min="0"
            max="5"
            value={formData.spicyLevel}
            onChange={(e) => handleInputChange("spicyLevel", Number.parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      <ImageUpload value={formData.image} onChange={(url) => handleInputChange("image", url)} disabled={isPending} />

      <div className="space-y-2">
        <Label htmlFor="allergens">Allergens</Label>
        <Input
          id="allergens"
          value={formData.allergens}
          onChange={(e) => handleInputChange("allergens", e.target.value)}
          placeholder="e.g., Gluten, Dairy, Nuts (comma-separated)"
        />
        <p className="text-sm text-muted-foreground">Separate multiple allergens with commas</p>
      </div>

      <div className="space-y-4">
        <Label>Dietary Options</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="vegetarian"
              checked={formData.isVegetarian}
              onCheckedChange={(checked) => handleInputChange("isVegetarian", checked)}
            />
            <Label htmlFor="vegetarian">Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="vegan"
              checked={formData.isVegan}
              onCheckedChange={(checked) => handleInputChange("isVegan", checked)}
            />
            <Label htmlFor="vegan">Vegan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="glutenFree"
              checked={formData.isGlutenFree}
              onCheckedChange={(checked) => handleInputChange("isGlutenFree", checked)}
            />
            <Label htmlFor="glutenFree">Gluten Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {initialData ? "Update Menu Item" : "Create Menu Item"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/restaurant/dashboard/menu")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
