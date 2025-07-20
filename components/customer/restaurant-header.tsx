import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, MapPin, Phone, Globe, Heart } from "lucide-react"

interface RestaurantHeaderProps {
  restaurant: {
    id: string
    name: string
    description: string | null
    image: string | null
    bannerImage: string | null
    cuisine: string | null
    rating: number | null
    deliveryTime: string | null
    deliveryFee: number | null
    streetAddress: string | null
    city: string | null
    state: string | null
    phone: string | null
    website: string | null
    isOpen: boolean
  }
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  // Use bannerImage if available, otherwise fall back to image, then placeholder
  const displayImage = restaurant.bannerImage || restaurant.image || "/placeholder.svg?height=300&width=800"

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-lg">
        <img
          src={displayImage || "/placeholder.svg"}
          alt={`${restaurant.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />

        {/* Favorite Button */}
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 hover:bg-white">
          <Heart className="w-5 h-5" />
        </Button>

        {/* Status Badge */}
        <Badge
          className={`absolute top-4 left-4 ${restaurant.isOpen ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
          {restaurant.isOpen ? "Open" : "Closed"}
        </Badge>
      </div>

      {/* Restaurant Info */}
      <div className="mt-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600 mt-1">{restaurant.description}</p>
          </div>

          <div className="flex items-center space-x-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-medium">{restaurant.rating || 4.5}</span>
            <span className="text-gray-500">(200+ reviews)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {restaurant.cuisine && <Badge variant="secondary">{restaurant.cuisine}</Badge>}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{restaurant.deliveryTime || "25-40 min"}</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className={restaurant.deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
              {restaurant.deliveryFee === 0
                ? "Free delivery"
                : `$${restaurant.deliveryFee?.toFixed(2) || "2.99"} delivery`}
            </span>
          </div>

          {restaurant.streetAddress && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>
                {restaurant.streetAddress}, {restaurant.city}, {restaurant.state}
              </span>
            </div>
          )}

          {restaurant.phone && (
            <div className="flex items-center space-x-1">
              <Phone className="w-4 h-4" />
              <span>{restaurant.phone}</span>
            </div>
          )}

          {restaurant.website && (
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
