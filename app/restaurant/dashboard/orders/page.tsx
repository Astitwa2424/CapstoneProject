import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LiveOrdersBoard } from "@/components/restaurant/live-orders-board"
import { OrderDockets } from "@/components/restaurant/order-dockets"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ShoppingBag, Printer, RefreshCw } from "lucide-react"

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "RESTAURANT") {
    redirect("/auth/restaurant/signin")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders & Kitchen</h1>
          <p className="text-gray-600">Manage incoming orders and kitchen operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print All
          </Button>
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Orders</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">New</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preparing</p>
                <p className="text-2xl font-bold text-orange-600">5</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">Cooking</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-2xl font-bold text-green-600">2</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out for Delivery</p>
                <p className="text-2xl font-bold text-purple-600">4</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Delivery</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live-orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-orders" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Live Orders
          </TabsTrigger>
          <TabsTrigger value="dockets" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Kitchen Dockets
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Order History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-orders">
          <LiveOrdersBoard />
        </TabsContent>

        <TabsContent value="dockets">
          <OrderDockets />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View completed and cancelled orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order History</h3>
                <p className="text-gray-500">View your completed orders and analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
