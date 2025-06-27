import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { MenuItemsList } from "@/components/restaurant/menu-items-list"
import { Skeleton } from "@/components/ui/skeleton"

function MenuItemsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function MenuManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">Here you can add, edit, and manage your menu items.</p>
        </div>
        <Link href="/restaurant/dashboard/menu/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Menu</CardTitle>
          <CardDescription>All the items currently available on your menu.</CardDescription>
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
