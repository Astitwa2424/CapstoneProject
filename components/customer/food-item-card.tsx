import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Leaf } from "lucide-react"
import Image from "next/image"

interface FoodItem {
  id: string
  name: string
  description: string | null
  price: number
  image?: string | null
  category: string | null
  isVegetarian?: boolean
  isVegan?: boolean
  spicyLevel?: number
  restaurantId: string
  restaurant?: {
    name: string
    rating: number
    deliveryFee: number
  }
}

interface FoodItemCardProps {
  item: FoodItem
}

export function FoodItemCard({ item }: FoodItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative h-48">
        <Image
          src={item.image || `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(item.name)}`}
          alt={item.name}
          fill
          className="object-cover"
        />
        {item.isVegetarian && (
          <Badge className="absolute top-2 left-2 bg-green-500">
            <Leaf className="w-3 h-3 mr-1" />
            Veg
          </Badge>
        )}
        {item.spicyLevel && item.spicyLevel > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500">{"🌶️".repeat(item.spicyLevel)}</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
          <span className="font-bold text-lg text-green-600">${item.price.toFixed(2)}</span>
        </div>

        {item.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>}

        {item.restaurant && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{item.restaurant.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>25-35 min</span>
            </div>
            <span>${item.restaurant.deliveryFee.toFixed(2)} delivery</span>
          </div>
        )}

        {item.category && (
          <Badge variant="outline" className="mt-2">
            {item.category}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
