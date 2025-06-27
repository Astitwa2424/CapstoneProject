import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye } from "lucide-react"

// Define a more specific type for the order items within an order
interface OrderItem {
  id: string
  quantity: number
  menuItem: {
    name: string
    price: number
  }
}

// Define the type for a single order object
interface Order {
  id: string
  status: string
  total: number
  createdAt: Date
  restaurant: {
    name: string
  }
  orderItems: OrderItem[]
}

// Define the props for the RecentOrders component
interface RecentOrdersProps {
  orders?: Order[] // Make orders optional
}

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "on_the_way":
        return "bg-blue-100 text-blue-800"
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="ghost" asChild>
          <Link href="/customer/profile/orders">View All Orders</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">#{order.id.slice(-6).toUpperCase()}</h4>
                    <Badge className={getStatusColor(order.status)}>{formatStatus(order.status)}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{order.restaurant.name}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{order.orderItems.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent orders found.</p>
            <Button asChild className="mt-4">
              <Link href="/customer/dashboard">Start Ordering</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
