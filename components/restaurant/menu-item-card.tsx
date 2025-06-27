"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { MenuItem } from "@prisma/client"

interface MenuItemCardProps {
  item: MenuItem
  onUpdate?: () => void
}

export function MenuItemCard({ item, onUpdate }: MenuItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const toggleAvailability = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/restaurant/menu-items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !item.isActive,
        }),
      })

      if (response.ok) {
        toast.success(`Item ${item.isActive ? "hidden" : "shown"} successfully`)
        onUpdate?.()
      } else {
        toast.error("Failed to update item")
      }
    } catch (error) {
      toast.error("Failed to update item")
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteItem = async () => {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/restaurant/menu-items/${item.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Item deleted successfully")
        onUpdate?.()
      } else {
        toast.error("Failed to delete item")
      }
    } catch (error) {
      toast.error("Failed to delete item")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className={`${!item.isActive ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
          <img
            src={item.image || `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(item.name)}`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <Badge variant={item.isActive ? "default" : "secondary"}>{item.isActive ? "Active" : "Hidden"}</Badge>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
            {item.category && <Badge variant="outline">{item.category}</Badge>}
          </div>

          <div className="flex flex-wrap gap-1">
            {item.isVegetarian && (
              <Badge variant="outline" className="text-green-600">
                Vegetarian
              </Badge>
            )}
            {item.isVegan && (
              <Badge variant="outline" className="text-green-600">
                Vegan
              </Badge>
            )}
            {item.isGlutenFree && (
              <Badge variant="outline" className="text-blue-600">
                Gluten Free
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/restaurant/dashboard/menu/${item.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>

        <Button variant="outline" size="sm" onClick={toggleAvailability} disabled={isUpdating}>
          {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={deleteItem}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-700 bg-transparent"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
