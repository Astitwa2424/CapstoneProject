"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"

interface MenuItem {
  id: string
  name: string
  description: string | null
  image: string | null
  price: number
  category: string | null
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  restaurant: {
    id: string
    name: string
  }
}

interface FoodItemCardProps {
  item: MenuItem
}

export function FoodItemCard({ item }: FoodItemCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantId: item.restaurant.id,
      restaurantName: item.restaurant.name,
      quantity: 1,
      specialInstructions: "",
    })
    toast.success(`${item.name} added to cart!`)
  }

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
      <div className="relative">
        <img
          src={item.image || "/placeholder.svg?height=150&width=300&query=food"}
          alt={item.name}
          className="w-full h-32 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {item.isVegetarian && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Vegetarian
            </Badge>
          )}
          {item.isVegan && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              Vegan
            </Badge>
          )}
          {item.isGlutenFree && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
              Gluten Free
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{item.restaurant.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
          <Button onClick={handleAddToCart} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
