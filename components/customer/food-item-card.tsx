"use client"

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
  const placeholderImage = `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(item.name)}`

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/90 backdrop-blur-sm border-0 rounded-2xl hover:-translate-y-1">
      <div className="relative h-48">
        <Image
          src={item.image || placeholderImage}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = placeholderImage
          }}
        />
        {item.isVegetarian && (
          <Badge className="absolute top-3 left-3 bg-green-500 text-white border-none shadow-lg rounded-full">
            <Leaf className="w-3 h-3 mr-1" />
            Veg
          </Badge>
        )}
        {item.spicyLevel && item.spicyLevel > 0 && (
          <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none shadow-lg rounded-full">
            {"🌶️".repeat(item.spicyLevel)}
          </Badge>
        )}
      </div>
      <CardContent className="p-5 bg-white">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg line-clamp-1 text-gray-900">{item.name}</h3>
          <span className="font-bold text-lg text-red-500">${item.price.toFixed(2)}</span>
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
        )}

        {item.restaurant && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center bg-yellow-50 rounded-full px-2 py-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-semibold text-gray-900">{item.restaurant.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center bg-gray-50 rounded-full px-2 py-1">
              <Clock className="w-4 h-4 mr-1" />
              <span className="font-semibold">25-35 min</span>
            </div>
            <span className="font-semibold text-gray-900">${item.restaurant.deliveryFee.toFixed(2)} delivery</span>
          </div>
        )}

        {item.category && (
          <Badge variant="outline" className="mt-3 border-red-200 text-red-600 bg-red-50 rounded-full">
            {item.category}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
