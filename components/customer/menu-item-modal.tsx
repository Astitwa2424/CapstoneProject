"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { MinusIcon, PlusIcon } from "lucide-react"
import type { MenuItem, RestaurantProfile, Modification } from "@prisma/client"
import { useCart } from "@/hooks/use-cart"

type MenuItemWithModifications = MenuItem & {
  modifications: Modification[]
}

type RestaurantWithMenuItems = RestaurantProfile & {
  menuItems: MenuItemWithModifications[]
}

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: MenuItemWithModifications
  restaurant: RestaurantWithMenuItems
}

export function MenuItemModal({ isOpen, onClose, item, restaurant }: MenuItemModalProps) {
  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [selectedModifications, setSelectedModifications] = useState<Modification[]>([])
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [totalPrice, setTotalPrice] = useState(item.price)

  useEffect(() => {
    const basePrice = item.price
    const modificationsCost = selectedModifications.reduce((sum, mod) => sum + (mod.cost || 0), 0)
    setTotalPrice((basePrice + modificationsCost) * quantity)
  }, [quantity, selectedModifications, item.price])

  const handleModificationChange = (mod: Modification, checked: boolean) => {
    setSelectedModifications((prev) => {
      if (checked) {
        return [...prev, mod]
      } else {
        return prev.filter((m) => m.id !== mod.id)
      }
    })
  }

  const handleAddToCart = () => {
    const cartItemToAdd = {
      menuItem: {
        ...item,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
        },
      },
      quantity,
      selectedModifications,
      specialInstructions,
    }

    addToCart(cartItemToAdd)
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuantity(1)
      setSelectedModifications([])
      setSpecialInstructions("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{item.name}</DialogTitle>
          <DialogDescription className="text-base">
            {item.description || "Customize your order below."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {item.image && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
          )}

          {item.modifications && item.modifications.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Modifications</Label>
              <div className="space-y-2">
                {item.modifications.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`mod-${mod.id}`}
                        onCheckedChange={(checked) => handleModificationChange(mod, checked as boolean)}
                      />
                      <Label htmlFor={`mod-${mod.id}`} className="text-sm font-normal">
                        {mod.name}
                      </Label>
                    </div>
                    <span className="text-sm font-medium">+${(mod.cost || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-base font-semibold">
              Special Instructions
            </Label>
            <Textarea
              id="instructions"
              placeholder="e.g., no onions, extra sauce..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <Button onClick={handleAddToCart} className="w-full" size="lg">
          Add to Cart - ${totalPrice.toFixed(2)}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
