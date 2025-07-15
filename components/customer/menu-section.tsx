"use client"

import MenuItemCard from "@/components/customer/menu-item-card"
import { Separator } from "@/components/ui/separator"
import type { MenuItem, RestaurantProfile, Modification } from "@prisma/client"

type MenuItemWithModifications = MenuItem & {
  modifications: Modification[]
}

type RestaurantWithMenuItems = RestaurantProfile & {
  menuItems: MenuItemWithModifications[]
}

interface MenuSectionProps {
  category: string
  items: MenuItemWithModifications[]
  restaurant: RestaurantWithMenuItems
}

export function MenuSection({ category, items, restaurant }: MenuSectionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div id={category.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-20">
      <div className="my-6">
        <h3 className="text-xl font-semibold tracking-tight">{category}</h3>
        <Separator className="mt-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
        ))}
      </div>
    </div>
  )
}
