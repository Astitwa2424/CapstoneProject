import Image from "next/image"
import { notFound } from "next/navigation"
import { getRestaurantProfileById } from "@/app/customer/actions"
import { MenuSection } from "@/components/customer/menu-section"
import { CartSidebar } from "@/components/customer/cart-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, Share2Icon, ClockIcon, StarIcon } from "lucide-react"
import Link from "next/link"
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

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = await getRestaurantProfileById(params.id)

  if (!restaurant) {
    notFound()
  }

  // Type assertion since we know the include worked
  const restaurantWithMenu = restaurant as RestaurantWithMenuItems

  // Group menu items by category
  const menuByCategory = restaurantWithMenu.menuItems.reduce(
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
    <div className="flex min-h-screen flex-col">
      {/* Restaurant Header */}
      <div className="relative h-48 w-full overflow-hidden md:h-64">
        <Image
          src={restaurantWithMenu.image || "/placeholder.svg?height=256&width=1024&text=Restaurant+Banner"}
          alt={`${restaurantWithMenu.name} banner`}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Back and Share Buttons */}
        <div className="absolute left-4 top-4 flex gap-2">
          <Button asChild variant="secondary" size="icon" className="rounded-full">
            <Link href="/customer/dashboard">
              <ChevronLeftIcon className="h-5 w-5" />
              <span className="sr-only">Back to restaurants</span>
            </Link>
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Share2Icon className="h-5 w-5" />
            <span className="sr-only">Share restaurant</span>
          </Button>
        </div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-bold md:text-4xl">{restaurantWithMenu.name}</h1>
          <p className="text-sm md:text-base">{restaurantWithMenu.cuisine}</p>
          <div className="mt-2 flex items-center gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{restaurantWithMenu.rating?.toFixed(1) || "4.5"}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{restaurantWithMenu.isOpen ? "Open" : "Closed"}</span>
            </div>
            <span>{restaurantWithMenu.address}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-1 flex-col gap-8 px-4 py-8 md:flex-row">
        {/* Main Content */}
        <main className="flex-1">
          {/* Restaurant Details */}
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">About {restaurantWithMenu.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {restaurantWithMenu.description || "Delicious food delivered fresh to your door."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Delivery Fee</p>
                <p className="text-gray-600 dark:text-gray-400">${restaurantWithMenu.deliveryFee.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Minimum Order</p>
                <p className="text-gray-600 dark:text-gray-400">${restaurantWithMenu.minOrder.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Operating Hours</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {restaurantWithMenu.operatingHours || "9 AM - 10 PM"}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Contact</p>
                <p className="text-gray-600 dark:text-gray-400">{restaurantWithMenu.phone || "N/A"}</p>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          {/* Menu */}
          <section>
            <h2 className="mb-6 text-2xl font-bold">Menu</h2>
            {Object.entries(menuByCategory).length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">No menu items available at the moment.</p>
              </div>
            ) : (
              Object.entries(menuByCategory).map(([category, items]) => (
                <MenuSection key={category} category={category} items={items} restaurant={restaurantWithMenu} />
              ))
            )}
          </section>
        </main>

        {/* Cart Sidebar */}
        <aside className="w-full md:w-96">
          <CartSidebar restaurantId={restaurantWithMenu.id} />
        </aside>
      </div>
    </div>
  )
}
