import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { MenuItemsList } from "@/components/restaurant/menu-items-list"

function MenuItemsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  )
}

export default function MenuManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant's menu items, categories, and availability.</p>
        </div>
        <Link href="/restaurant/dashboard/menu/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Menu Items</CardTitle>
          <CardDescription>View and manage all your menu items. Click on any item to edit its details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MenuItemsListSkeleton />}>
            <MenuItemsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
