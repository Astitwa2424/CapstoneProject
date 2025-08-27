import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, MapPin, Phone, Globe, Heart, Share } from "lucide-react"
import type { SyntheticEvent } from "react"

interface RestaurantHeaderProps {
  restaurant: {
    id: string
    name: string
    description: string | null
    logoImage: string | null
    image: string | null
    cuisine: string | string[] | null
    rating: number | null
    deliveryTime: string | null
    deliveryFee: number | null
    isOpen: boolean
    phone: string | null
    website: string | null
    streetAddress: string | null
    city: string | null
    state: string | null
  }
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const displayImage = restaurant.logoImage || restaurant.image || null
  const placeholderImage = `/placeholder.svg?width=1200&height=400&text=${encodeURIComponent(restaurant.name + " Logo")}`

  // Handle cuisine display
  const cuisineDisplay = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine.join(", ")
    : restaurant.cuisine || "Restaurant"

  // Format address
  const address = [restaurant.streetAddress, restaurant.city, restaurant.state].filter(Boolean).join(", ")

  return (
    <div className="relative">
      <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        {displayImage ? (
          <img
            src={displayImage || "/placeholder.svg"}
            alt={`${restaurant.name} logo`}
            className="max-w-xs max-h-48 object-contain"
            onError={(e: SyntheticEvent<HTMLImageElement>) => {
              console.log(`Failed to load logo for ${restaurant.name}:`, displayImage)
              e.currentTarget.src = placeholderImage
            }}
            onLoad={(e: SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.filter = "none"
            }}
          />
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-3xl font-bold text-gray-600">{restaurant.name.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-700">{restaurant.name}</h2>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
            <Share className="w-4 h-4" />
          </Button>
        </div>

        {/* Status badge */}
        {!restaurant.isOpen && (
          <div className="absolute top-4 left-4">
            <Badge variant="destructive" className="bg-red-600 text-white">
              Currently Closed
            </Badge>
          </div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="relative -mt-16 mx-4 md:mx-6 lg:mx-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                {restaurant.isOpen && <Badge className="bg-green-600 text-white">Open</Badge>}
              </div>

              <p className="text-gray-600 mb-2">{cuisineDisplay}</p>

              {restaurant.description && <p className="text-gray-700 mb-4 max-w-2xl">{restaurant.description}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating?.toFixed(1) || "4.5"}</span>
                  <span>(200+ reviews)</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.deliveryTime || "25-40 min"}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className={restaurant.deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                    {restaurant.deliveryFee === 0
                      ? "Free delivery"
                      : `$${restaurant.deliveryFee?.toFixed(2) || "2.99"} delivery`}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                {address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{address}</span>
                  </div>
                )}

                {restaurant.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}

                {restaurant.website && (
                  <div className="flex items-center gap-1">
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
        </div>
      </div>
    </div>
  )
}
