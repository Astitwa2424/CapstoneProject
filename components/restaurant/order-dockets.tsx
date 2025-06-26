"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Printer, Clock, User, MapPin, Phone } from "lucide-react"

interface DocketOrder {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: Array<{
    name: string
    quantity: number
    specialInstructions?: string
  }>
  orderTime: string
  deliveryType: "delivery" | "pickup"
  status: "preparing" | "ready"
  estimatedTime: number
}

const mockDockets: DocketOrder[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customerName: "John Smith",
    customerPhone: "+1 (555) 123-4567",
    customerAddress: "123 Main St, Sydney NSW 2000",
    items: [
      { name: "Margherita Pizza", quantity: 1, specialInstructions: "Extra cheese" },
      { name: "Caesar Salad", quantity: 1 },
      { name: "Garlic Bread", quantity: 2, specialInstructions: "Well done" },
    ],
    orderTime: "2024-01-15T14:30:00Z",
    deliveryType: "delivery",
    status: "preparing",
    estimatedTime: 25,
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customerName: "Sarah Johnson",
    customerPhone: "+1 (555) 987-6543",
    items: [
      { name: "Chicken Burger", quantity: 2, specialInstructions: "No onions" },
      { name: "Sweet Potato Fries", quantity: 1 },
    ],
    orderTime: "2024-01-15T14:15:00Z",
    deliveryType: "pickup",
    status: "preparing",
    estimatedTime: 20,
  },
]

export function OrderDockets() {
  const [dockets, setDockets] = useState<DocketOrder[]>(mockDockets)

  const printDocket = (docketId: string) => {
    // In a real app, this would trigger the printer
    console.log(`Printing docket ${docketId}`)
    // You could integrate with a thermal printer API here
  }

  const markReady = (docketId: string) => {
    setDockets((prev) =>
      prev.map((docket) => (docket.id === docketId ? { ...docket, status: "ready" as const } : docket)),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kitchen Dockets</h3>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dockets.map((docket) => (
          <Card key={docket.id} className="font-mono text-sm border-2 border-dashed">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">{docket.orderNumber}</CardTitle>
                <Badge
                  className={
                    docket.status === "preparing" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                  }
                >
                  {docket.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">{new Date(docket.orderTime).toLocaleTimeString()}</div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Customer Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <User className="w-3 h-3" />
                  <span className="font-semibold">{docket.customerName}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Phone className="w-3 h-3" />
                  <span>{docket.customerPhone}</span>
                </div>
                {docket.deliveryType === "delivery" && docket.customerAddress && (
                  <div className="flex items-start gap-1 text-xs">
                    <MapPin className="w-3 h-3 mt-0.5" />
                    <span>{docket.customerAddress}</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {docket.deliveryType.toUpperCase()}
                </Badge>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-2">
                <div className="font-semibold text-xs">ORDER ITEMS:</div>
                {docket.items.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                    {item.specialInstructions && (
                      <div className="text-xs text-red-600 font-semibold pl-2">*** {item.specialInstructions} ***</div>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Timing */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>EST: {docket.estimatedTime}min</span>
                </div>
                <div className="text-right">
                  <div>Order Time:</div>
                  <div className="font-semibold">{new Date(docket.orderTime).toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => printDocket(docket.id)} className="flex-1">
                  <Printer className="w-3 h-3 mr-1" />
                  Print
                </Button>
                {docket.status === "preparing" && (
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
        <Card>
          <CardContent className="p-8 text-center">
            <Printer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Dockets</h3>
            <p className="text-gray-500">Kitchen dockets will appear here when orders are being prepared.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
