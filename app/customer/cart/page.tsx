"use client"

import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotal, getItemCount, clearCart } = useCart()
  const router = useRouter()

  const handleProceedToPayment = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }
    router.push("/customer/payment")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const subtotal = getTotal()
  const deliveryFee = 2.99
  const serviceFee = subtotal * 0.05
  const total = subtotal + deliveryFee + serviceFee

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/customer/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="text-gray-600">Review your items and proceed to checkout</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-4">Add some delicious items to get started!</p>
            <Button asChild>
              <Link href="/customer/dashboard">Browse Restaurants</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({getItemCount()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${item.specialInstructions || index}`}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Image
                        src={item.image || `/placeholder.svg?height=80&width=80&query=${item.name}`}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-400 mt-1">Notes: {item.specialInstructions}</p>
                        )}
                        {item.modifications && item.modifications.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">Modifications:</p>
                            {item.modifications.map((mod) => (
                              <p key={mod.id} className="text-xs text-gray-600">
                                • {mod.label} (+{formatPrice(mod.cost)})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="font-semibold">
                            {formatPrice(
                              (item.price + (item.modifications?.reduce((total, mod) => total + mod.cost, 0) || 0)) *
                                item.quantity,
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.cartItemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={clearCart} className="bg-transparent">
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({getItemCount()} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>{formatPrice(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
