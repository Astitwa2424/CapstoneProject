"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, Frown } from "lucide-react"

export function CartSidebar() {
  const { items, getItemCount, getCartSubtotal, updateQuantity, removeFromCart } = useCart()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const itemCount = isClient ? getItemCount() : 0
  const cartSubtotal = isClient ? getCartSubtotal() : 0

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center p-0">
              {itemCount}
            </Badge>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart ({itemCount} items)</SheetTitle>
        </SheetHeader>
        <Separator />
        {itemCount > 0 ? (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="flex flex-col gap-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <Image
                      src={item.menuItem.image || "/placeholder.svg?height=64&width=64&query=food"}
                      alt={item.menuItem.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">${(item.totalPrice / item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 mt-2 text-muted-foreground hover:text-red-500"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <Button asChild size="lg" className="w-full">
                  <Link href="/customer/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Frown className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground mt-2">Add some delicious food to get started!</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
