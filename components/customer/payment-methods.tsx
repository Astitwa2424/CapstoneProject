"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface PaymentMethod {
  id: string
  type: "visa" | "mastercard" | "amex"
  last4: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
}

export function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "visa",
      last4: "4242",
      expiryMonth: "06",
      expiryYear: "26",
      isDefault: true,
    },
    {
      id: "2",
      type: "mastercard",
      last4: "5555",
      expiryMonth: "12",
      expiryYear: "25",
      isDefault: false,
    },
  ])

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "💳"
      case "mastercard":
        return "💳"
      case "amex":
        return "💳"
      default:
        return "💳"
    }
  }

  const handleAddCard = () => {
    toast.info("Add new card functionality coming soon!")
  }

  const handleEditCard = (id: string) => {
    toast.info("Edit card functionality coming soon!")
  }

  const handleDeleteCard = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
    toast.success("Payment method removed successfully!")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Methods</CardTitle>
        <Button onClick={handleAddCard} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Card
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  {method.type.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• {method.last4}</p>
                  <p className="text-sm text-gray-500">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
                {method.isDefault && <Badge variant="secondary">Default</Badge>}
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditCard(method.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(method.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
