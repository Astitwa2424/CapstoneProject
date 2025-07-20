import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, ShoppingBag } from "lucide-react"
import { getCustomerOrders } from "@/app/customer/actions"
import { OrderDetailsDialog } from "@/components/customer/order-details-dialog"

export default async function OrderHistoryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/customer/signin")
  }

  const orders = await getCustomerOrders()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "on_the_way":
        return "bg-blue-100 text-blue-800"
      case "new":
        return "bg-purple-100 text-purple-800"
      case "accepted":
        return "bg-orange-100 text-orange-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600">View your past orders and reorder your favorites</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{order.restaurant.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <ShoppingBag className="w-4 h-4" />
                    Order #{order.id.slice(-8).toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${order.total.toFixed(2)}</div>
                  <Badge className={getStatusColor(order.status)}>{formatStatus(order.status)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.orderItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {order.orderItems.length > 3 && (
                  <div className="text-sm text-gray-500">+{order.orderItems.length - 3} more items</div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <OrderDetailsDialog orderId={order.id}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </OrderDetailsDialog>
                <Button size="sm" variant="secondary">
                  Reorder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No orders yet</p>
            <p className="text-sm text-gray-500 mb-4">Start by ordering from your favorite restaurant!</p>
            <Button asChild>
              <a href="/customer/dashboard">Browse Restaurants</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
