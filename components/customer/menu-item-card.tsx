"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import type { MenuItem } from "@prisma/client"

interface MenuItemCardProps {
  item: MenuItem
  restaurantId: string
}

export function MenuItemCard({ item, restaurantId }: MenuItemCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: restaurantId,
    })
    toast.success(`${item.name} added to cart`)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              {item.isVegetarian && (
                <Badge variant="secondary" className="text-xs">
                  Vegetarian
                </Badge>
              )}
              {item.isVegan && (
                <Badge variant="secondary" className="text-xs">
                  Vegan
                </Badge>
              )}
              {item.isGlutenFree && (
                <Badge variant="secondary" className="text-xs">
                  Gluten Free
                </Badge>
              )}
            </div>

            {item.description && <p className="text-gray-600 text-sm mb-3">{item.description}</p>}

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-green-600">${item.price.toFixed(2)}</span>
              <Button onClick={handleAddToCart} size="sm">
                Add to Cart
              </Button>
            </div>
          </div>

          {item.image && (
            <div className="ml-4">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
