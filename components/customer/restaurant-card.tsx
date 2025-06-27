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
  cuisine: string | null
  rating: number | null
  deliveryTime: string | null
  deliveryFee: number | null
  isOpen: boolean
}

interface RestaurantCardProps {
  restaurant: Restaurant
  featured?: boolean
}

export function RestaurantCard({ restaurant, featured = false }: RestaurantCardProps) {
  const cardClass = featured
    ? "group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    : "group cursor-pointer hover:shadow-md transition-all duration-200"

  return (
    <Link href={`/customer/restaurant/${restaurant.id}`}>
      <Card className={cardClass}>
        <div className="relative">
          <img
            src={restaurant.image || "/placeholder.svg?height=200&width=400&query=restaurant"}
            alt={restaurant.name}
            className={`w-full object-cover rounded-t-lg ${featured ? "h-48" : "h-40"}`}
          />
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
          {restaurant.deliveryFee === 0 && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white">Free Delivery</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-semibold text-gray-900 ${featured ? "text-lg" : "text-base"}`}>{restaurant.name}</h3>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{restaurant.rating || 4.5}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine || "Various"}</p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime || "25-40 min"}</span>
            </div>
            <span className={restaurant.deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
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
