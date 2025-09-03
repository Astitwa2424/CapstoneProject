import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RestaurantCard } from "@/components/customer/restaurant-card"
import { FoodItemCard } from "@/components/customer/food-item-card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { RestaurantProfile, MenuItem } from "@prisma/client"

type RestaurantWithMenuItems = RestaurantProfile & {
  menuItems: MenuItem[]
}

async function getRestaurants(): Promise<RestaurantWithMenuItems[]> {
  try {
    const restaurants = await prisma.restaurantProfile.findMany({
      where: {
        isActive: true,
      },
      include: {
        menuItems: {
          take: 4,
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return restaurants
  } catch (error) {
    console.error("Error fetching restaurants:", error)
    return []
  }
}

async function getPopularItems() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isActive: true,
      },
      include: {
        restaurant: true,
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    })
    return menuItems
  } catch (error) {
    console.error("Error fetching popular items:", error)
    return []
  }
}

export default async function CustomerDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/auth/customer/signin")
  }

  const restaurants = await getRestaurants()
  const popularItems = await getPopularItems()

  const categories = [
    { name: "All", active: true },
    { name: "Italian", active: false },
    { name: "Asian", active: false },
    { name: "American", active: false },
    { name: "Mexican", active: false },
    { name: "Healthy", active: false },
    { name: "Desserts", active: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Discover Great Food</h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Order from your favorite restaurants and get it delivered fast
          </p>
        </div>

        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex flex-wrap gap-3 mb-6 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={category.active ? "default" : "outline"}
                  size="lg"
                  className={
                    category.active
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg border-0 px-6 py-3 rounded-full font-semibold"
                      : "border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 px-6 py-3 rounded-full font-semibold transition-all duration-200"
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 text-sm justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4"
              >
                Sort: Recommended
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4"
              >
                Price Range
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4"
              >
                Dietary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4"
              >
                Delivery Time
              </Button>
            </div>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Featured Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.slice(0, 3).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No restaurants available</h3>
              <p className="text-gray-600">Check back later for new restaurants in your area.</p>
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold text-gray-900">Popular Right Now</h2>
            <Link href="#">
              <Button variant="link" className="text-red-500 hover:text-red-600 font-semibold text-lg">
                View all →
              </Button>
            </Link>
          </div>
          {popularItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularItems.slice(0, 4).map((item) => (
                <FoodItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <p className="text-gray-600">No popular items available at the moment.</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">All Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No restaurants available</h3>
              <p className="text-gray-600">Be the first to discover great restaurants in your area!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
