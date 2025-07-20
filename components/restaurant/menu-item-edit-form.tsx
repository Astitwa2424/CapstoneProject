"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { updateMenuItem } from "@/app/restaurant/actions"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import type { MenuItem, Modification } from "@prisma/client"

interface MenuItemEditFormProps {
  menuItem: MenuItem & { modifications?: Modification[] }
}

export function MenuItemEditForm({ menuItem }: MenuItemEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: menuItem.name,
    description: menuItem.description || "",
    price: menuItem.price,
    category: menuItem.category || "",
    allergens: Array.isArray(menuItem.allergens) ? menuItem.allergens.join(", ") : "",
    image: menuItem.image || "",
    spicyLevel: menuItem.spicyLevel || 0,
    isVegetarian: menuItem.isVegetarian || false,
    isVegan: menuItem.isVegan || false,
    isGlutenFree: menuItem.isGlutenFree || false,
  })

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateMenuItem(menuItem.id, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        allergens: formData.allergens,
        image: formData.image,
        spicyLevel: Number(formData.spicyLevel),
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
      })

      if (result.success) {
        toast.success("Menu item updated successfully!")
        router.push("/restaurant/dashboard?tab=menu")
      } else {
        toast.error(result.error || "Failed to update menu item")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
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

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          type="url"
          value={formData.image}
          onChange={(e) => handleInputChange("image", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

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
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vegetarian"
              checked={formData.isVegetarian}
              onCheckedChange={(checked) => handleInputChange("isVegetarian", checked as boolean)}
            />
            <Label htmlFor="vegetarian">Vegetarian</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vegan"
              checked={formData.isVegan}
              onCheckedChange={(checked) => handleInputChange("isVegan", checked as boolean)}
            />
            <Label htmlFor="vegan">Vegan</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="glutenFree"
              checked={formData.isGlutenFree}
              onCheckedChange={(checked) => handleInputChange("isGlutenFree", checked as boolean)}
            />
            <Label htmlFor="glutenFree">Gluten Free</Label>
          </div>
        </div>
      </div>

      {menuItem.modifications && menuItem.modifications.length > 0 && (
        <div className="space-y-2">
          <Label>Current Modifications</Label>
          <div className="bg-muted p-3 rounded-md">
            {menuItem.modifications.map((mod) => (
              <div key={mod.id} className="flex justify-between items-center py-1">
                <span className="text-sm">{mod.label}</span>
                <span className="text-sm font-medium">+${mod.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Modification editing will be available in a future update</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Update Menu Item
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/restaurant/dashboard?tab=menu")}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
