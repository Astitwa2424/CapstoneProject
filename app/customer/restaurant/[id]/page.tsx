"use client"

import { notFound } from "next/navigation"
import { getRestaurantProfileById } from "@/app/customer/actions"
import { MenuSection } from "@/components/customer/menu-section"
import { CartSidebar } from "@/components/customer/cart-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeftIcon, Share2Icon, StarIcon, MapPinIcon, PhoneIcon, DollarSignIcon, TimerIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import type { MenuItem, RestaurantProfile, Modification, ModificationChoice } from "@prisma/client"

type ModificationWithChoices = Modification & {
  choices: ModificationChoice[]
}

type MenuItemWithModifications = MenuItem & {
  modifications: ModificationWithChoices[]
}

type RestaurantWithMenuItems = RestaurantProfile & {
  menuItems: MenuItemWithModifications[]
}

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const [restaurant, setRestaurant] = useState<RestaurantWithMenuItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllHours, setShowAllHours] = useState(false)

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const { id } = await params
        const restaurantData = await getRestaurantProfileById(id)

        if (!restaurantData) {
          notFound()
        }

        setRestaurant(restaurantData as RestaurantWithMenuItems)
      } catch (error) {
        console.error("Error loading restaurant:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    notFound()
  }

  const formatOperatingHours = (hours: string | null) => {
    if (!hours) return "Hours not available"

    // If it's already in a structured format, return as is
    if (hours.includes("Monday:") || hours.includes("Mon:")) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      const dayAbbr = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

      return days.map((day, index) => {
        const dayPattern = new RegExp(`${day}:\\s*([^,]+)`, "i")
        const abbrPattern = new RegExp(`${dayAbbr[index]}:\\s*([^,]+)`, "i")

        const match = hours.match(dayPattern) || hours.match(abbrPattern)
        const time = match ? match[1].trim() : "Closed"

        return { day: day.slice(0, 3), time }
      })
    }

    // For simple format like "9 AM - 10 PM", apply to all days
    return [
      { day: "Mon", time: hours },
      { day: "Tue", time: hours },
      { day: "Wed", time: hours },
      { day: "Thu", time: hours },
      { day: "Fri", time: hours },
      { day: "Sat", time: hours },
      { day: "Sun", time: "Closed" },
    ]
  }

  const operatingHoursData = formatOperatingHours(restaurant.operatingHours)

  // Group menu items by category
  const menuByCategory = restaurant.menuItems.reduce(
    (acc: Record<string, MenuItemWithModifications[]>, item: MenuItemWithModifications) => {
      const category = item.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, MenuItemWithModifications[]>,
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="icon" className="hover:bg-gray-100">
              <Link href="/customer/dashboard">
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="sr-only">Back to restaurants</span>
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                {restaurant.logoImage && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                    <Image
                      src={restaurant.logoImage || "/placeholder.svg"}
                      alt={`${restaurant.name} logo`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                    />
                  </div>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {restaurant.cuisine}
                </Badge>
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-gray-900">{restaurant.rating?.toFixed(1) || "4.5"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className={`font-medium text-sm ${restaurant.isOpen ? "text-emerald-600" : "text-red-600"}`}>
                    {restaurant.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Share2Icon className="h-5 w-5" />
              <span className="sr-only">Share restaurant</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <MapPinIcon className="h-4 w-4" />
            <span className="text-sm">{restaurant.address}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-1 flex-col gap-8 px-4 py-8 md:flex-row">
        {/* Main Content */}
        <main className="flex-1">
          <section className="mb-8">
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <DollarSignIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Delivery Fee</p>
                    <p className="text-xl font-bold text-gray-900">${restaurant.deliveryFee.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <DollarSignIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Minimum Order</p>
                    <p className="text-xl font-bold text-gray-900">${restaurant.minOrder.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow col-span-2 md:col-span-1">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 rounded-lg p-2 mt-1">
                    <TimerIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-sm font-medium mb-2">Operating Hours</p>
                    {typeof operatingHoursData === "string" ? (
                      <p className="text-sm font-semibold text-gray-900">{operatingHoursData}</p>
                    ) : (
                      <div className="space-y-1">
                        {(showAllHours ? operatingHoursData : operatingHoursData.slice(0, 3)).map(({ day, time }) => (
                          <div key={day} className="flex justify-between text-xs">
                            <span className="text-gray-600 font-medium">{day}</span>
                            <span className="text-gray-900 font-semibold">{time}</span>
                          </div>
                        ))}
                        {operatingHoursData.length > 3 && (
                          <button
                            onClick={() => setShowAllHours(!showAllHours)}
                            className="text-xs text-blue-600 hover:text-blue-800 pt-1 transition-colors cursor-pointer"
                          >
                            {showAllHours ? "Show less" : `+${operatingHoursData.length - 3} more days`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-lg p-2">
                    <PhoneIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Contact</p>
                    <p className="text-sm font-semibold text-gray-900">{restaurant.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About {restaurant.name}</h2>
              <p className="text-gray-600 leading-relaxed">
                {restaurant.description ||
                  "Delicious food delivered fresh to your door. Experience authentic flavors and quality ingredients in every bite."}
              </p>
            </div>
          </section>

          <section className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Menu</h2>
            {Object.entries(menuByCategory).length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg font-medium">No menu items available</p>
                <p className="text-gray-500 text-sm mt-1">Check back soon for delicious options!</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(menuByCategory).map(([category, items]) => (
                  <MenuSection key={category} category={category} items={items} restaurant={restaurant} />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Cart Sidebar */}
        <aside className="w-full md:w-96">
          <CartSidebar restaurantId={restaurant.id} />
        </aside>
      </div>
    </div>
  )
}
