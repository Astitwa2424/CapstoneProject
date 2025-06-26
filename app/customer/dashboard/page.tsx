import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Star, Heart, User, CreditCard } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"

export default async function CustomerDashboard() {
  console.log("🏠 Customer Dashboard - Starting auth check")

  const session = await auth()
  console.log("🏠 Customer Dashboard - Session:", session ? "exists" : "null")
  console.log("🏠 Customer Dashboard - User role:", session?.user?.role)

  // Check if user is authenticated
  if (!session?.user) {
    console.log("❌ Customer Dashboard - No session, redirecting to customer signin")
    redirect("/auth/customer/signin")
  }

  // Check if user has the right role (allow any role for now to test)
  if (session.user.role !== "CUSTOMER") {
    console.log("❌ Customer Dashboard - Wrong role, redirecting to unauthorized")
    redirect("/unauthorized")
  }

  console.log("✅ Customer Dashboard - Access granted")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
              <p className="text-gray-600">Ready to order some delicious food?</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <LogoutButton />
              <Button>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Money Saved</p>
                      <p className="text-2xl font-bold">$127</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Favorite Restaurants</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Rating Given</p>
                      <p className="text-2xl font-bold">4.8</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest food orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      restaurant: "Pizza Palace",
                      items: "2x Margherita Pizza",
                      status: "Delivered",
                      time: "2 hours ago",
                      amount: "$24.99",
                    },
                    {
                      restaurant: "Burger Barn",
                      items: "1x Classic Burger, 1x Fries",
                      status: "Delivered",
                      time: "1 day ago",
                      amount: "$18.50",
                    },
                    {
                      restaurant: "Sushi Zen",
                      items: "1x Salmon Roll, 1x Tuna Roll",
                      status: "Delivered",
                      time: "3 days ago",
                      amount: "$32.00",
                    },
                  ].map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div>
                          <p className="font-semibold">{order.restaurant}</p>
                          <p className="text-sm text-gray-600">{order.items}</p>
                          <p className="text-xs text-gray-500">{order.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {order.status}
                        </Badge>
                        <p className="font-semibold">{order.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>All your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Order history will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Restaurants</CardTitle>
                <CardDescription>Your most loved places to order from</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Favorite restaurants will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Account settings will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
