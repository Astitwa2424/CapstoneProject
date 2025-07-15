"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, Loader2 } from "lucide-react"
import { getPaymentMethods } from "@/app/customer/actions"
import type { PaymentMethod } from "@prisma/client"
import AddPaymentMethodDialog from "@/components/customer/add-payment-method-dialog"
import { toast } from "sonner"

export default function PaymentPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPaymentMethods = async () => {
    setIsLoading(true)
    try {
      const methods = await getPaymentMethods()
      setPaymentMethods(methods)
    } catch (error) {
      console.error("Error loading payment methods:", error)
      toast.error("Failed to load payment methods")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
        <p className="text-gray-600">Manage your payment methods and billing information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saved Cards
          </CardTitle>
          <CardDescription>Your saved payment methods for faster checkout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium">•••• {method.last4}</div>
                      <div className="text-sm text-gray-500">
                        {method.cardHolder} • {method.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires {method.expiryMonth}/{method.expiryYear.slice(-2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No payment methods saved yet</p>
            </div>
          )}

          <AddPaymentMethodDialog onSuccess={loadPaymentMethods}>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Payment Method
            </Button>
          </AddPaymentMethodDialog>
        </CardContent>
      </Card>
    </div>
  )
}
