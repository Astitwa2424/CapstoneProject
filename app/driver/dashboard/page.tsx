import { requireRole } from "@/lib/auth-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, DollarSign, Clock, MapPin, Star, Navigation, Phone } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"
import { DocumentUpload } from "@/components/verification/document-upload"

export default async function DriverDashboard() {
  const session = await requireRole(["DRIVER"])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Online
              </Badge>
              <LogoutButton />
              <Button>
                <Truck className="w-4 h-4 mr-2" />
                Go Online
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                      <p className="text-2xl font-bold">$127.50</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Deliveries Today</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Truck className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hours Online</p>
                      <p className="text-2xl font-bold">6.5</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rating</p>
                      <p className="text-2xl font-bold">4.9</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Delivery */}
            <Card>
              <CardHeader>
                <CardTitle>Active Delivery</CardTitle>
                <CardDescription>Current delivery in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #12345</h3>
                      <p className="text-gray-600">Pizza Palace → John Doe</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">In Transit</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">123 Main St, City</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">ETA: 15 minutes</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button size="sm">
                      <Navigation className="w-4 h-4 mr-2" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Customer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
                <CardDescription>Your latest completed deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      order: "#12344",
                      restaurant: "Burger Barn",
                      customer: "Jane Smith",
                      earnings: "$8.50",
                      time: "1 hour ago",
                    },
                    {
                      order: "#12343",
                      restaurant: "Sushi Zen",
                      customer: "Mike Johnson",
                      earnings: "$12.00",
                      time: "2 hours ago",
                    },
                    {
                      order: "#12342",
                      restaurant: "Taco Fiesta",
                      customer: "Sarah Wilson",
                      earnings: "$6.75",
                      time: "3 hours ago",
                    },
                  ].map((delivery, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{delivery.order}</p>
                        <p className="text-sm text-gray-600">
                          {delivery.restaurant} → {delivery.customer}
                        </p>
                        <p className="text-xs text-gray-500">{delivery.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{delivery.earnings}</p>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries">
            <Card>
              <CardHeader>
                <CardTitle>Delivery History</CardTitle>
                <CardDescription>All your completed deliveries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Delivery history will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
                <CardDescription>Track your earnings and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Earnings details will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <DocumentUpload userType="driver" />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Driver Profile</CardTitle>
                <CardDescription>Manage your driver information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Profile settings will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
