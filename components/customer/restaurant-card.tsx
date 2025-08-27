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
  console.log("[v0] RestaurantCard debug:", {
    restaurantName: restaurant.name,
    logoImage: restaurant.logoImage,
    image: restaurant.image,
    restaurantId: restaurant.id,
  })

  const cardClass = featured
    ? "group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    : "group cursor-pointer hover:shadow-md transition-all duration-200"

  const displayImage = restaurant.logoImage || restaurant.image || null
  const placeholderImage = `/placeholder.svg?width=400&height=200&text=${encodeURIComponent(restaurant.name)}`

  console.log("[v0] Display image for", restaurant.name, ":", displayImage)

  // Handle cuisine display - convert array to string if needed
  const cuisineDisplay = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(", ")
    : restaurant.cuisine || "Various"

  return (
    <Link href={`/customer/restaurant/${restaurant.id}`} className="block">
      <Card
        className={`${cardClass} border-border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden`}
      >
        <div className="relative">
          <div className={`w-full object-cover overflow-hidden ${featured ? "h-52" : "h-44"}`}>
            <img
              src={displayImage || placeholderImage}
              alt={`${restaurant.name} logo`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(event) => {
                // Only log if we're trying to load a real image (not already a placeholder)
                if (displayImage && !event.currentTarget.src.includes("placeholder.svg")) {
                  console.log(`Failed to load image for ${restaurant.name}:`, displayImage)
                }
                event.currentTarget.src = placeholderImage
              }}
              onLoad={(event) => {
                // Remove any error styling when image loads successfully
                event.currentTarget.style.filter = "none"
              }}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full shadow-sm backdrop-blur-sm"
          >
            <Heart className="w-4 h-4 text-muted-foreground" />
          </Button>

          {restaurant.deliveryFee === 0 && (
            <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-600 text-white border-none shadow-sm">
              Free Delivery
            </Badge>
          )}

          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-white font-medium px-4 py-2">
                Closed
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6 bg-card">
          <div className="flex items-start justify-between mb-3">
            <h3 className={`font-bold text-foreground line-clamp-1 ${featured ? "text-xl" : "text-lg"}`}>
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-3">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-foreground">{restaurant.rating?.toFixed(1) || "4.5"}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3 font-medium">{cuisineDisplay}</p>

          {restaurant.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{restaurant.description}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{restaurant.deliveryTime || "25-40 min"}</span>
            </div>
            <span className={`font-semibold ${restaurant.deliveryFee === 0 ? "text-green-600" : "text-foreground"}`}>
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
