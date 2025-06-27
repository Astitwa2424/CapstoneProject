"use client"

import { MenuItemCard } from "@/components/customer/menu-item-card"
import type { MenuItem } from "@prisma/client"

interface MenuSectionProps {
  category: string
  items: MenuItem[]
  restaurantId: string
}

export function MenuSection({ category, items = [], restaurantId }: MenuSectionProps) {
  // Safety check - if no items, don't render anything
  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{category}</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} restaurantId={restaurantId} />
        ))}
      </div>
    </section>
  )
}
