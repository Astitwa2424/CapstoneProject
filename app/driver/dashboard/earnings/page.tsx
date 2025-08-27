"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, Clock, Package, Calendar, Download, Eye, CreditCard } from "lucide-react"
import { useState } from "react"

interface EarningsData {
  todayEarnings: number
  weeklyEarnings: number
  monthlyEarnings: number
  totalDeliveries: number
  averageRating: number
  onlineHours: number
  pendingPayout: number
  lastPayout: {
    amount: number
    date: string
  }
}

export default function EarningsPage() {
  const [earningsData, setEarningsData] = useState<EarningsData>({
    todayEarnings: 127.5,
    weeklyEarnings: 892.3,
    monthlyEarnings: 3456.8,
    totalDeliveries: 156,
    averageRating: 4.8,
    onlineHours: 42.5,
    pendingPayout: 234.6,
    lastPayout: {
      amount: 657.9,
      date: "2025-01-20",
    },
  })

  const weeklyGoal = 1000
  const weeklyProgress = (earningsData.weeklyEarnings / weeklyGoal) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Wallet</h1>
          <p className="text-gray-600">Track your earnings, payouts, and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <CreditCard className="w-4 h-4 mr-2" />
            Payout Settings
          </Button>
        </div>
      </div>

      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${earningsData.todayEarnings.toFixed(2)}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${earningsData.weeklyEarnings.toFixed(2)}</div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Weekly Goal</span>
                <span>${weeklyGoal}</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{earningsData.totalDeliveries}</div>
            <p className="text-xs text-gray-600 mt-1">
              Avg: ${(earningsData.monthlyEarnings / earningsData.totalDeliveries).toFixed(2)} per delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Online Hours</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{earningsData.onlineHours}h</div>
            <p className="text-xs text-gray-600 mt-1">
              ${(earningsData.weeklyEarnings / earningsData.onlineHours).toFixed(2)}/hour this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Pending Payout
            </CardTitle>
            <CardDescription>Available for withdrawal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-4">${earningsData.pendingPayout.toFixed(2)}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery earnings</span>
                <span className="font-medium">${(earningsData.pendingPayout * 0.85).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tips</span>
                <span className="font-medium">${(earningsData.pendingPayout * 0.15).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Available</span>
                  <span>${earningsData.pendingPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4" size="lg">
              Request Payout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Payout</CardTitle>
            <CardDescription>Most recent payment received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">${earningsData.lastPayout.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(earningsData.lastPayout.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Completed
                </Badge>
              </div>
              <div className="text-sm text-gray-600">Deposited to your linked bank account ending in ****4532</div>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings History Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>Detailed breakdown of your earnings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly" className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-600 mb-2">{day}</div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="text-sm font-medium">${(Math.random() * 200 + 50).toFixed(2)}</div>
                      <div className="text-xs text-gray-600">{Math.floor(Math.random() * 15 + 5)} trips</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <div className="text-center py-8 text-gray-600">Monthly earnings chart would be displayed here</div>
            </TabsContent>

            <TabsContent value="yearly" className="space-y-4">
              <div className="text-center py-8 text-gray-600">Yearly earnings chart would be displayed here</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
