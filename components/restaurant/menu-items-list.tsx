"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MenuItemCard } from "@/components/restaurant/menu-item-card"
import {
  getMenuItemsForRestaurant,
  deleteMenuItem,
  updateMenuItemActiveStatus,
  duplicateMenuItem,
} from "@/app/restaurant/actions"
import { toast } from "sonner"
import { Loader2, ChefHat } from "lucide-react"
import type { MenuItem, Modification } from "@prisma/client"

type MenuItemWithModifications = MenuItem & {
  modifications: Modification[]
}

export function MenuItemsList() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState<MenuItemWithModifications[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const loadMenuItems = async () => {
    setIsLoading(true)
    try {
      const result = await getMenuItemsForRestaurant()
      if (result.success) {
        setMenuItems(result.menuItems)
      } else {
        toast.error(result.error || "Failed to load menu items.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred while loading menu items.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMenuItems()
  }, [])

  const handleEdit = (itemId: string) => {
    router.push(`/restaurant/dashboard/menu/${itemId}/edit`)
  }

  const handleDelete = (itemId: string) => {
    startTransition(async () => {
      const result = await deleteMenuItem(itemId)
      if (result.success) {
        toast.success("Menu item deleted successfully.")
        await loadMenuItems()
      } else {
        toast.error(result.error || "Failed to delete menu item.")
      }
    })
  }

  const handleToggleActive = (itemId: string, isActive: boolean) => {
    startTransition(async () => {
      const result = await updateMenuItemActiveStatus(itemId, isActive)
      if (result.success) {
        toast.success(`Menu item ${isActive ? "activated" : "deactivated"}.`)
        await loadMenuItems()
      } else {
        toast.error(result.error || "Failed to update menu item.")
      }
    })
  }

  const handleDuplicate = (itemId: string) => {
    startTransition(async () => {
      const result = await duplicateMenuItem(itemId)
      if (result.success) {
        toast.success("Menu item duplicated successfully.")
        await loadMenuItems()
      } else {
        toast.error(result.error || "Failed to duplicate menu item.")
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No menu items yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Get started by adding your first menu item.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {menuItems.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onEdit={() => handleEdit(item.id)}
          onDelete={() => handleDelete(item.id)}
          onToggleActive={(isActive) => handleToggleActive(item.id, isActive)}
          onDuplicate={() => handleDuplicate(item.id)}
          isPending={isPending}
        />
      ))}
    </div>
  )
}
