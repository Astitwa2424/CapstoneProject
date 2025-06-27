import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default async function OrderHistoryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/customer/signin")
  }

  // Mock order data for now
  const mockOrders = [
    {
      id: "1",
      restaurantName: "Pizza Palace",
      total: 24.99,
      status: "delivered",
      createdAt: new Date("2024-01-15"),
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 18.99 },
        { name: "Garlic Bread", quantity: 1, price: 6.0 },
      ],
    },
    {
      id: "2",
      restaurantName: "Burger House",
      total: 15.5,
      status: "delivered",
      createdAt: new Date("2024-01-10"),
      items: [
        { name: "Classic Burger", quantity: 1, price: 12.5 },
        { name: "Fries", quantity: 1, price: 3.0 },
      ],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "on_the_way":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600">View your past orders and reorder your favorites</p>
      </div>

      <div className="space-y-4">
        {mockOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{order.restaurantName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    {order.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${order.total.toFixed(2)}</div>
                  <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button size="sm">Reorder</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No orders yet. Start by ordering from your favorite restaurant!</p>
            <Button className="mt-4">Browse Restaurants</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
