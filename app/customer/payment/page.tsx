"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCart, type CartItem } from "@/hooks/use-cart"
import { PaymentMethods } from "@/components/customer/payment-methods"
import { AddressAutocompleteInput, type StructuredAddress } from "@/components/customer/address-autocomplete-input"
import { getPaymentMethods, placeOrder } from "@/app/customer/actions"
import { toast } from "sonner"
import { CreditCard, MapPin, FileText, ShoppingBag, Loader2 } from "lucide-react"
import { PaymentMethod } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutPage() {
  const router = useRouter()
  const { state, getTotal, clearCart, isCartLoading } = useCart()
  const { items } = state
  const total = getTotal()

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress | null>(null)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isMethodsLoading, setIsMethodsLoading] = useState(true)

  const deliveryFee = 5.99
  const serviceFee = 2.99
  const finalTotal = total + deliveryFee + serviceFee

  const loadPaymentMethods = useCallback(async () => {
    setIsMethodsLoading(true)
    try {
      const methods = await getPaymentMethods()
      setPaymentMethods(methods)
      if (methods.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(methods[0].id)
      }
    } catch (error) {
      console.error("Error loading payment methods:", error)
      toast.error("Failed to load payment methods")
    } finally {
      setIsMethodsLoading(false)
    }
  }, [selectedPaymentMethod])

  useEffect(() => {
    if (!isCartLoading && items.length === 0) {
      toast.info("Your cart is empty. Redirecting to dashboard...")
      router.push("/customer/dashboard")
      return
    }

    if (!isCartLoading && items.length > 0) {
      loadPaymentMethods()
    }
  }, [isCartLoading, items.length, router, loadPaymentMethods])

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method")
      return
    }

    if (!deliveryAddress.trim() || !structuredAddress) {
      toast.error("Please select a valid delivery address from the suggestions")
      return
    }

    setIsPlacingOrder(true)

    try {
      const result = await placeOrder(
        items,
        selectedPaymentMethod,
        deliveryAddress.trim(),
        specialInstructions.trim() || undefined
      )

      if (result.success && result.orderId) {
        clearCart()
        toast.success("Order placed successfully!")
        router.push(`/customer/order/${result.orderId}/track`)
      } else {
        toast.error(result.error || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (isCartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600">Review your order and complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item: CartItem) => (
                <div
                  key={`${item.id}-${item.specialInstructions || "default"}`}
                  className="flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                    )}
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
              <CardDescription>Where should we deliver your order?</CardDescription>
            </CardHeader>
            <CardContent>
              <AddressAutocompleteInput
                value={deliveryAddress}
                onValueChange={setDeliveryAddress}
                onAddressSelect={setStructuredAddress}
              />
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Special Instructions
              </CardTitle>
              <CardDescription>Any special requests for your order? (Optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions for restaurant or driver</Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g., Ring doorbell, leave at door, extra sauce on the side..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment + Summary */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
              <CardDescription>Choose how you'd like to pay</CardDescription>
            </CardHeader>
            <CardContent>
              {isMethodsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <PaymentMethods
                  paymentMethods={paymentMethods}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onSelectPaymentMethod={setSelectedPaymentMethod}
                  onPaymentMethodsChange={loadPaymentMethods}
                />
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Order Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || isMethodsLoading || !selectedPaymentMethod || !deliveryAddress.trim()}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order - $${finalTotal.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By placing your order, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
