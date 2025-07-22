"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/components/providers"
import type { Order, RestaurantProfile } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { acceptOrder } from "@/lib/actions/order.actions"

type AvailableOrder = Order & { restaurantProfile: RestaurantProfile }
type Stats = {
  todaysEarnings: string
  completedDeliveries: number
  averageRating: string
  activeHours: string
}

interface DriverDashboardContentProps {
  initialStats: Stats
  initialAvailableOrders: AvailableOrder[]
}

export default function DriverDashboardContent({ initialStats, initialAvailableOrders }: DriverDashboardContentProps) {
  const [availableOrders, setAvailableOrders] = useState(initialAvailableOrders)
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleNewOrder = (newOrder: AvailableOrder) => {
      setAvailableOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])
    }

    const handleOrderAccepted = (data: { orderId: string }) => {
      setAvailableOrders((prev) => prev.filter((o) => o.id !== data.orderId))
    }

    socket.on("new_order_for_drivers", handleNewOrder)
    socket.on("order_accepted", handleOrderAccepted)

    return () => {
      socket.off("new_order_for_drivers", handleNewOrder)
      socket.off("order_accepted", handleOrderAccepted)
    }
  }, [socket])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <span className="text-sm font-medium">Today's Earnings</span>
          <span className="text-2xl font-semibold">{initialStats.todaysEarnings}</span>
        </div>
        <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <span className="text-sm font-medium">Completed Deliveries</span>
          <span className="text-2xl font-semibold">{initialStats.completedDeliveries}</span>
        </div>
        <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <span className="text-sm font-medium">Average Rating</span>
          <span className="text-2xl font-semibold">{initialStats.averageRating}</span>
        </div>
        <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-4">
          <span className="text-sm font-medium">Active Hours</span>
          <span className="text-2xl font-semibold">{initialStats.activeHours}</span>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Available Orders</h2>
        <Table>
          <TableCaption>A list of your available orders.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Restaurant</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {availableOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.restaurantProfile.name}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>5 km</TableCell>
                <TableCell className="text-right">
                  <form action={acceptOrder.bind(null, order.id)}>
                    <Button size="sm" type="submit">
                      Accept
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
