import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardHeader } from "@/components/customer/dashboard-header"
import { RestaurantCard } from "@/components/customer/restaurant-card"
import { FoodItemCard } from "@/components/customer/food-item-card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

async function getRestaurants() {
  const restaurants = await prisma.restaurantProfile.findMany({
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-8">
          {/* Category Filters */}
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

          {/* Sort and Filter Options */}
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

        {/* Featured Restaurants */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.slice(0, 3).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={true} />
            ))}
          </div>
        </section>

        {/* Popular Right Now */}
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

        {/* All Restaurants */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={false} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">FoodHub</h3>
              <p className="text-gray-400 text-sm">
                The best food ordering platform for your favorite local restaurants.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Contact</li>
                <li>Support</li>
                <li>FAQ</li>
                <li>Affiliates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Terms</li>
                <li>Privacy</li>
                <li>Cookies</li>
                <li>Licenses</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 FoodHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
