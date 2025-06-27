import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { RestaurantHeader } from "@/components/customer/restaurant-header"
import { MenuSection } from "@/components/customer/menu-section"
import { CartSidebar } from "@/components/customer/cart-sidebar"
import type { MenuItem, RestaurantProfile } from "@prisma/client"

interface FullMenuItem extends MenuItem {
  modifications: {
    id: string
    label: string
    cost: number
  }[]
}

interface FullRestaurantProfile extends RestaurantProfile {
  menuItems: FullMenuItem[]
}

async function getRestaurant(id: string): Promise<FullRestaurantProfile | null> {
  if (!id) {
    return null
  }
  const restaurant = await prisma.restaurantProfile.findUnique({
    where: { id },
    include: {
      menuItems: {
        where: { isActive: true },
        include: {
          modifications: true,
        },
        orderBy: { category: "asc" },
      },
    },
  })
  return restaurant
}

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/customer/signin")
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/unauthorized")
  }

  const restaurant = await getRestaurant(params.id)

  if (!restaurant) {
    notFound()
  }

  const menuItems = restaurant.menuItems || []

  const menuByCategory = menuItems.reduce(
    (acc, item) => {
      const category = item.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, FullMenuItem[]>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <RestaurantHeader restaurant={restaurant} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {menuItems.length > 0 ? (
              Object.entries(menuByCategory).map(([category, items]) => (
                <MenuSection key={category} category={category} items={items || []} restaurantId={restaurant.id} />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-700">No Menu Items Available</h3>
                <p className="text-gray-500 mt-2">
                  This restaurant is currently updating its menu. Please check back later.
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <CartSidebar restaurantId={restaurant.id} restaurantName={restaurant.name} />
          </div>
        </div>
      </div>
    </div>
  )
}
