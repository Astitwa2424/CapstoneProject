import { getRestaurantIdFromSession } from "@/lib/auth-utils"
import { getInitialOrders } from "@/app/restaurant/actions"
import { LiveOrdersBoard } from "@/components/restaurant/live-orders-board"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

function OrdersPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-10 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function RestaurantOrdersPage() {
  const restaurantId = await getRestaurantIdFromSession()

  if (!restaurantId) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription>Could not identify your restaurant. Please try logging out and back in.</AlertDescription>
      </Alert>
    )
  }

  const initialOrders = await getInitialOrders()

  return (
    <div className="space-y-6">
      <Suspense fallback={<OrdersPageSkeleton />}>
        <LiveOrdersBoard restaurantId={restaurantId} initialOrders={initialOrders} />
      </Suspense>
    </div>
  )
}
