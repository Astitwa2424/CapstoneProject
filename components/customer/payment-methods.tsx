"use client"

import type { PaymentMethod } from "@prisma/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import AddPaymentMethodDialog from "@/components/customer/add-payment-method-dialog"
import { CreditCard, Plus } from "lucide-react"

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  selectedPaymentMethod: string
  onSelectPaymentMethod: (id: string) => void
  onPaymentMethodsChange: () => void
}

export function PaymentMethods({
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onPaymentMethodsChange,
}: PaymentMethodsProps) {
  return (
    <div className="space-y-4">
      <RadioGroup value={selectedPaymentMethod} onValueChange={onSelectPaymentMethod} className="space-y-3">
        {paymentMethods.map((method) => (
          <Label
            key={method.id}
            htmlFor={method.id}
            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 transition-colors"
          >
            <RadioGroupItem value={method.id} id={method.id} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
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
                  {method.expiryMonth}/{method.expiryYear.slice(-2)}
                </div>
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
      {paymentMethods.length === 0 && (
        <p className="text-sm text-center text-gray-500 py-4">You have no saved payment methods.</p>
      )}
      <AddPaymentMethodDialog onSuccess={onPaymentMethodsChange}>
        <Button variant="outline" className="w-full bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Add New Card
        </Button>
      </AddPaymentMethodDialog>
    </div>
  )
}
