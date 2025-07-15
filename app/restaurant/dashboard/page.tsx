"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { signOut } from "next-auth/react"
import { LogOut, Plus, TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react"
import Link from "next/link"

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function RestaurantDashboard() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="space-y-6">
      {/* Header with Logout */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your restaurant.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/restaurant/dashboard/menu/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </Link>
          <Button variant="outline" onClick={handleSignOut} className="text-red-600 hover:text-red-700 bg-transparent">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,350</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+5 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+8% this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">+0.2 from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your restaurant efficiently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/restaurant/dashboard/menu/new">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Menu Item
                </Button>
              </Link>
              <Link href="/restaurant/dashboard/menu">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  View Menu Management
                </Button>
              </Link>
              <Link href="/restaurant/dashboard/orders">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Restaurant Status</CardTitle>
              <CardDescription>Current operational status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-green-100 text-green-800">Open</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Orders</span>
                <Badge variant="secondary">Accepting</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivery</span>
                <Badge variant="secondary">Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </div>
  )
}
