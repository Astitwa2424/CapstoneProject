"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Printer, Clock, User, MapPin, Phone } from "lucide-react"
import type { Order, OrderItem, CustomerProfile, User as UserType } from "@prisma/client"

type FullOrderItem = OrderItem & { menuItem: { name: string } }
type FullOrder = Order & {
  orderItems: FullOrderItem[]
  customerProfile: CustomerProfile & { user: UserType }
}

interface OrderDocketsProps {
  initialOrders: FullOrder[]
}

export function OrderDockets({ initialOrders }: OrderDocketsProps) {
  const [dockets, setDockets] = useState<FullOrder[]>(initialOrders)

  const printDocket = (docketId: string) => {
    // In a real app, this would trigger a print-specific view or API
    console.log(`Printing docket ${docketId}`)
    window.print()
  }

  const markReady = (docketId: string) => {
    setDockets((prev) => prev.map((docket) => (docket.id === docketId ? { ...docket, status: "READY" } : docket)))
    // Here you would also make a server action call to update the order status in the DB
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h3 className="text-lg font-semibold">Kitchen Dockets</h3>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-1">
        {dockets.map((docket) => (
          <Card key={docket.id} className="font-mono text-sm border-2 border-dashed break-inside-avoid">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">#{docket.id.slice(-6).toUpperCase()}</CardTitle>
                <Badge
                  className={
                    docket.status === "PREPARING" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                  }
                >
                  {docket.status}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">{new Date(docket.createdAt).toLocaleTimeString()}</div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <User className="w-3 h-3" />
                  <span className="font-semibold">{docket.customerProfile.user.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Phone className="w-3 h-3" />
                  <span>{docket.customerProfile.phone || "N/A"}</span>
                </div>
                {docket.deliveryAddress && (
                  <div className="flex items-start gap-1 text-xs">
                    <MapPin className="w-3 h-3 mt-0.5" />
                    <span>{docket.deliveryAddress}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="font-semibold text-xs">ORDER ITEMS:</div>
                {docket.orderItems.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                    </div>
                    {item.specialInstructions && (
                      <div className="text-xs text-red-600 font-semibold pl-2">*** {item.specialInstructions} ***</div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>EST: 25min</span>
                </div>
                <div className="text-right">
                  <div>Order Time:</div>
                  <div className="font-semibold">{new Date(docket.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 print:hidden">
                <Button size="sm" variant="outline" onClick={() => printDocket(docket.id)} className="flex-1">
                  <Printer className="w-3 h-3 mr-1" />
                  Print
                </Button>
                {docket.status === "PREPARING" && (
                  <Button
                    size="sm"
                    onClick={() => markReady(docket.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Ready
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dockets.length === 0 && (
        <Card className="print:hidden">
          <CardContent className="p-8 text-center">
            <Printer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Dockets</h3>
            <p className="text-gray-500">Kitchen dockets for new orders will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
