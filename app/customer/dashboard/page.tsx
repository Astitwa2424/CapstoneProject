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
    <div className="bg-background min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Discover Great Food</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Order from your favorite restaurants and get it delivered fast
          </p>
        </div>

        <div className="mb-12">
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={category.active ? "default" : "outline"}
                size="sm"
                className={
                  category.active
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    : "border-border hover:bg-muted/50 transition-colors"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sort: Recommended
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Price Range
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Dietary
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Delivery Time
            </Button>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Featured Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.slice(0, 3).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-3">No restaurants available</h3>
              <p className="text-muted-foreground">Check back later for new restaurants in your area.</p>
            </div>
          )}
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Popular Right Now</h2>
            <Link href="#">
              <Button variant="link" className="text-primary hover:text-primary/80 font-medium">
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
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground">No popular items available at the moment.</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">All Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} featured={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-3">No restaurants available</h3>
              <p className="text-muted-foreground">Be the first to discover great restaurants in your area!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
