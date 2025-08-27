"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Package, MapPin, Clock, Star, DollarSign, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { getDriverOrderHistory } from "../../actions"
import type { OrderStatus } from "@prisma/client"

interface OrderHistoryItem {
  id: string
  total: number
  deliveryFee: number
  status: OrderStatus
  deliveryAddress: string
  createdAt: string
  updatedAt: string
  restaurant: {
    name: string
    logoImage: string | null
    address: string | null
  }
  customerProfile: {
    user: { name: string | null }
  }
  orderItems: Array<{
    quantity: number
    menuItem: { name: string }
  }>
  reviews: Array<{
    rating: number | null
    comment: string | null
  }>
}

interface OrderHistoryData {
  orders: OrderHistoryItem[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export default function OrderHistoryPage() {
  const [historyData, setHistoryData] = useState<OrderHistoryData>({
    orders: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
  })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
  const [activeTab, setActiveTab] = useState("all")

  const fetchOrderHistory = async (page = 1, status?: OrderStatus) => {
    setLoading(true)
    try {
      const data = await getDriverOrderHistory(page, 10, status)
      setHistoryData(data)
    } catch (error) {
      console.error("Failed to fetch order history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const status = statusFilter === "ALL" ? undefined : statusFilter
    fetchOrderHistory(currentPage, status)
  }, [currentPage, statusFilter])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: OrderStatus) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEarnings = (order: OrderHistoryItem) => {
    // Assuming driver gets delivery fee + $2 base fee per delivery
    return (order.deliveryFee + 2).toFixed(2)
  }

  const deliveredOrders = historyData.orders.filter((order) => order.status === "DELIVERED")
  const totalEarnings = deliveredOrders.reduce((sum, order) => sum + Number.parseFloat(getEarnings(order)), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery History</h1>
          <p className="text-gray-600">Track your completed deliveries and earnings</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "ALL")}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Orders</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="OUT_FOR_DELIVERY">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{historyData.totalCount}</div>
            <p className="text-xs text-gray-600 mt-1">{deliveredOrders.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">From {deliveredOrders.length} deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {deliveredOrders.length > 0
                ? (
                    deliveredOrders
                      .filter((order) => order.reviews.length > 0 && order.reviews[0].rating)
                      .reduce((sum, order) => sum + (order.reviews[0].rating || 0), 0) /
                      deliveredOrders.filter((order) => order.reviews.length > 0 && order.reviews[0].rating).length || 0
                  ).toFixed(1)
                : "N/A"}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {deliveredOrders.filter((order) => order.reviews.length > 0).length} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order History List */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            {statusFilter === "ALL" ? "All your deliveries" : `${formatStatus(statusFilter)} deliveries`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : historyData.orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">No deliveries found</p>
              <p className="text-sm text-gray-500">
                {statusFilter === "ALL"
                  ? "Start accepting orders to see your delivery history here"
                  : `No ${formatStatus(statusFilter).toLowerCase()} deliveries found`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyData.orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={order.restaurant.logoImage || ""} alt={order.restaurant.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {order.restaurant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{order.restaurant.name}</h3>
                          <Badge className={getStatusColor(order.status)}>{formatStatus(order.status)}</Badge>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{order.deliveryAddress}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>
                              {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""} • Customer:{" "}
                              {order.customerProfile.user.name || "Anonymous"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">${getEarnings(order)}</div>
                      <div className="text-sm text-gray-600">earned</div>
                      {order.reviews.length > 0 && order.reviews[0].rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{order.reviews[0].rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {order.reviews.length > 0 && order.reviews[0].comment && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <span className="font-medium">Customer feedback:</span> "{order.reviews[0].comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {historyData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, historyData.totalCount)} of{" "}
                {historyData.totalCount} deliveries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {historyData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(historyData.totalPages, prev + 1))}
                  disabled={currentPage === historyData.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
