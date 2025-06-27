import { Badge } from "@/components/ui/badge"
import { Star, Clock, DollarSign } from "lucide-react"
import type { RestaurantProfile } from "@prisma/client"

interface RestaurantHeaderProps {
  restaurant: RestaurantProfile
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>

            {restaurant.description && <p className="text-gray-600 mb-4">{restaurant.description}</p>}

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{restaurant.rating || "4.5"}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">30-45 min</span>
              </div>

              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">${restaurant.deliveryFee?.toFixed(2) || "2.99"} delivery</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{restaurant.cuisine}</Badge>
              {restaurant.isOpen ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Open
                </Badge>
              ) : (
                <Badge variant="destructive">Closed</Badge>
              )}
            </div>
          </div>

          <div className="w-full md:w-48">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={`/placeholder.svg?height=200&width=200&text=${encodeURIComponent(restaurant.name)}`}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
