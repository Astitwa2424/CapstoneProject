"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Edit, Copy, Trash2, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"
import type { MenuItemWithModifications } from "@/app/restaurant/actions"
import {
  getMenuItemsForRestaurant,
  deleteMenuItem,
  updateMenuItemActiveStatus,
  duplicateMenuItem,
} from "@/app/restaurant/actions"

export function MenuItemsList() {
  const [menuItems, setMenuItems] = useState<MenuItemWithModifications[]>([])
  const [loading, setLoading] = useState(true)

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true)
      const items = await getMenuItemsForRestaurant()
      setMenuItems(items)
    } catch (error) {
      console.error("Failed to load menu items:", error)
      toast({
        title: "Error",
        description: "Failed to load menu items.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMenuItems()
  }, [loadMenuItems])

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateMenuItemActiveStatus(id, isActive)
      setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, isActive } : item)))
      toast({
        title: "Success",
        description: `Menu item ${isActive ? "activated" : "deactivated"}.`,
      })
    } catch (error) {
      console.error("Failed to update menu item status:", error)
      toast({
        title: "Error",
        description: "Failed to update menu item status.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      await deleteMenuItem(id)
      setMenuItems((prev) => prev.filter((item) => item.id !== id))
      toast({
        title: "Success",
        description: "Menu item deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete menu item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item.",
        variant: "destructive",
      })
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const newItem = await duplicateMenuItem(id)
      setMenuItems((prev) => [newItem, ...prev])
      toast({
        title: "Success",
        description: "Menu item duplicated successfully.",
      })
    } catch (error) {
      console.error("Failed to duplicate menu item:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate menu item.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Menu Items</h2>
          <p className="text-muted-foreground">Manage your restaurant's menu items</p>
        </div>
        <Link href="/restaurant/dashboard/menu/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </Link>
      </div>

      {menuItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No menu items found</p>
            <Link href="/restaurant/dashboard/menu/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Menu Item
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={item.isActive} onCheckedChange={(checked) => handleToggleActive(item.id, checked)} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/restaurant/dashboard/menu/${item.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(item.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">{item.category}</Badge>
                    <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
                    {item.spicyLevel > 0 && <Badge variant="outline">🌶️ {item.spicyLevel}/5</Badge>}
                  </div>
                  <div className="flex items-center space-x-2">
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
                {item.modifications.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      Modifications: {item.modifications.map((mod) => mod.label).join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
