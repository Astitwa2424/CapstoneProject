"use client" // Added client directive to enable event handlers

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, Heart } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  description: string | null
  image: string | null
  logoImage: string | null
  cuisine: string | string[] | null
  rating: number | null
  deliveryTime?: string | null
  deliveryFee: number | null
  isOpen: boolean
}

interface RestaurantCardProps {
  restaurant: Restaurant
  featured?: boolean
}

export function RestaurantCard({ restaurant, featured = false }: RestaurantCardProps) {
  const cardClass = featured
    ? "group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
    : "group cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1"

  const displayImage = restaurant.logoImage || restaurant.image || null
  const placeholderImage = `/placeholder.svg?width=400&height=200&text=${encodeURIComponent(restaurant.name)}`

  // Handle cuisine display - convert array to string if needed
  const cuisineDisplay = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(", ")
    : restaurant.cuisine || "Various"

  return (
    <Link href={`/customer/restaurant/${restaurant.id}`} className="block">
      <Card
        className={`${cardClass} border-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg overflow-hidden rounded-2xl`}
      >
        <div className="relative">
          <div className={`w-full object-cover overflow-hidden ${featured ? "h-52" : "h-44"}`}>
            <img
              src={displayImage || placeholderImage}
              alt={`${restaurant.name} logo`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(event) => {
                event.currentTarget.src = placeholderImage
              }}
              onLoad={(event) => {
                event.currentTarget.style.filter = "none"
              }}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/95 hover:bg-white rounded-full shadow-lg backdrop-blur-sm border border-white/20"
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
          </Button>

          {restaurant.deliveryFee === 0 && (
            <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-500 text-white border-none shadow-lg rounded-full px-3 py-1">
              Free Delivery
            </Badge>
          )}

          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-2xl">
              <Badge variant="destructive" className="text-white font-medium px-6 py-3 rounded-full shadow-lg">
                Closed
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6 bg-white/95">
          <div className="flex items-start justify-between mb-3">
            <h3 className={`font-bold text-gray-900 line-clamp-1 ${featured ? "text-xl" : "text-lg"}`}>
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-3 bg-yellow-50 rounded-full px-2 py-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-gray-900">{restaurant.rating?.toFixed(1) || "4.5"}</span>
            </div>
          </div>

          <p className="text-sm text-red-500 mb-3 font-semibold">{cuisineDisplay}</p>

          {restaurant.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{restaurant.description}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 rounded-full px-3 py-1">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">{restaurant.deliveryTime || "25-40 min"}</span>
            </div>
            <span className={`font-bold ${restaurant.deliveryFee === 0 ? "text-green-600" : "text-gray-900"}`}>
              {restaurant.deliveryFee === 0
                ? "Free delivery"
                : `$${restaurant.deliveryFee?.toFixed(2) || "2.99"} delivery`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
