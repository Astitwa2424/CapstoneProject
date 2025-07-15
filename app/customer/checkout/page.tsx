"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { getPaymentMethods, placeOrder } from "@/app/customer/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, CreditCard, AlertCircle, ShoppingCart, Plus } from "lucide-react"
import AddPaymentMethodDialog from "@/components/customer/add-payment-method-dialog"
import AddressAutocompleteInput from "@/components/customer/address-autocomplete-input"
import { toast } from "sonner"
import type { PaymentMethod } from "@prisma/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function CheckoutPage() {
  const { items, getCartTotals, restaurantId, clearCart } = useCart()
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>(undefined)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoading(true)
    try {
      const methods = await getPaymentMethods()
      setPaymentMethods(methods)
      if (methods.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(methods[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
      toast.error("Could not load your payment methods.")
    } finally {
      setIsLoading(false)
    }
  }, [selectedPaymentMethod])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method.")
      return
    }
    if (!deliveryAddress) {
      toast.error("Please enter a delivery address.")
      return
    }
    if (!restaurantId) {
      toast.error("Restaurant information is missing from your cart.")
      return
    }

    setIsPlacingOrder(true)
    const { subtotal, deliveryFee, serviceFee, total } = getCartTotals()

    const orderData = {
      cartItems: items,
      paymentMethodId: selectedPaymentMethod,
      deliveryAddress,
      restaurantId,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
    }

    const result = await placeOrder(orderData)

    if (result.success && result.orderId) {
      toast.success("Order placed successfully!")
      clearCart()
      router.push(`/customer/order/${result.orderId}/track`)
    } else {
      toast.error(result.error || "Failed to place order.")
    }
    setIsPlacingOrder(false)
  }

  const { subtotal, deliveryFee, serviceFee, total } = getCartTotals()

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center">
        <ShoppingCart className="h-16 w-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-4">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => router.push("/customer/dashboard")}>Start Shopping</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressAutocompleteInput onAddressSelect={(address) => setDeliveryAddress(address)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    {paymentMethods.map((method) => (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <CreditCard className="h-6 w-6 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ending in {method.last4}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Expires {method.expiryMonth}/{method.expiryYear.slice(-2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  {paymentMethods.length === 0 && (
                    <div className="text-center text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                      <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                      <p>No payment methods found.</p>
                      <p className="text-sm">Please add a new card to proceed.</p>
                    </div>
                  )}

                  <AddPaymentMethodDialog onSuccess={fetchPaymentMethods}>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Card
                    </Button>
                  </AddPaymentMethodDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="flex-1 pr-2">
                    {item.quantity} x {item.menuItem.name}
                  </span>
                  <span className="font-mono">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <p>Subtotal</p>
                <p className="font-mono">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Delivery Fee</p>
                <p className="font-mono">${deliveryFee.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p>Service Fee</p>
                <p className="font-mono">${serviceFee.toFixed(2)}</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p className="font-mono">${total.toFixed(2)}</p>
              </div>
              <Button
                className="w-full"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || isLoading || !selectedPaymentMethod || !deliveryAddress}
              >
                {isPlacingOrder ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  `Place Order ($${total.toFixed(2)})`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
