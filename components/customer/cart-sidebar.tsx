"use client"

import { useCart } from "@/hooks/use-cart"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2 } from "lucide-react"
import { placeOrder } from "@/app/customer/actions"
import { toast } from "sonner"

interface CartSidebarProps {
  restaurantId: string
}

export function CartSidebar({ restaurantId }: CartSidebarProps) {
  const { state, updateQuantity, removeFromCart, getTotal } = useCart()

  const handlePlaceOrder = async () => {
    if (state.items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    try {
      const result = await placeOrder(state.items, restaurantId)
      if (result.success) {
        toast.success("Order placed successfully!")
      } else {
        toast.error(result.error || "Failed to place order.")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
    }
  }

  if (state.items.length === 0 || state.restaurantId !== restaurantId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">Your cart is empty.</p>
        </CardContent>
      </Card>
    )
  }

  const subtotal = getTotal()
  const deliveryFee = 2.99 // Example fee
  const taxes = subtotal * 0.1 // Example 10% tax
  const total = subtotal + deliveryFee + taxes

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Cart</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {state.items.map((item) => (
          <div key={item.id + item.specialInstructions}>
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                {item.specialInstructions && (
                  <p className="text-xs text-gray-400 whitespace-pre-wrap">{item.specialInstructions}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 bg-transparent"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 bg-transparent"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Separator />
        <div className="w-full flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="w-full flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="w-full flex justify-between text-sm">
          <span>Taxes</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="w-full flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button className="w-full" onClick={handlePlaceOrder}>
          Place Order
        </Button>
      </CardFooter>
    </Card>
  )
}
