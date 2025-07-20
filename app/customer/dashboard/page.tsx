import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RestaurantCard } from "@/components/customer/restaurant-card"
import { FoodItemCard } from "@/components/customer/food-item-card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import type { RestaurantProfile, MenuItem } from "@prisma/client"

type RestaurantWithMenuItems = RestaurantProfile & {
  menuItems: MenuItem[]
}

async function getRestaurants(): Promise<RestaurantWithMenuItems[]> {
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
  })
  return restaurants
}

async function getPopularItems() {
  const menuItems = await prisma.menuItem.findMany({
    where: {
      isActive: true,
    },
    include: {
      restaurant: true,
    },
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
  })
  return menuItems
}

export default async function CustomerDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/auth/signin")
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={category.active ? "default" : "outline"}
              size="sm"
              className={category.active ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Button variant="ghost" size="sm">
            Sort: Recommended
          </Button>
          <Button variant="ghost" size="sm">
            Price Range
          </Button>
          <Button variant="ghost" size="sm">
            Dietary
          </Button>
          <Button variant="ghost" size="sm">
            Delivery Time
          </Button>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.slice(0, 3).map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={true} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Popular Right Now</h2>
          <Button variant="ghost" className="text-red-500 hover:text-red-600">
            View all →
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularItems.map((item) => (
            <FoodItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={false} />
          ))}
        </div>
      </section>
    </main>
  )
}
