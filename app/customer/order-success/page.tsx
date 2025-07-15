"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderNumber, setOrderNumber] = useState("")

  useEffect(() => {
    if (orderId) {
      // Generate order number from order ID
      setOrderNumber(orderId.slice(-6).toUpperCase())
    }
  }, [orderId])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order. We're preparing it now.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Details</span>
              <Badge variant="secondary">#{orderNumber}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Estimated Delivery Time</p>
                <p className="text-sm text-gray-600">25-35 minutes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-sm text-gray-600">Your saved address</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-sm text-gray-600">We'll call you if needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Order Confirmed</p>
                <p className="text-sm text-gray-600">Your order has been received and is being prepared</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-500">Preparing</p>
                <p className="text-sm text-gray-600">The restaurant is preparing your food</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-500">Out for Delivery</p>
                <p className="text-sm text-gray-600">Your order is on its way</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-500">Delivered</p>
                <p className="text-sm text-gray-600">Enjoy your meal!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/customer/profile/orders" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Track Order
            </Button>
          </Link>
          <Link href="/customer/dashboard" className="flex-1">
            <Button className="w-full">Order Again</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
