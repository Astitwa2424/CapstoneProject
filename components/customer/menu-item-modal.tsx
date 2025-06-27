"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import type { MenuItem } from "@prisma/client"
import { Minus, Plus } from "lucide-react"

interface FullMenuItem extends MenuItem {
  modifications: {
    id: string
    label: string
    cost: number
  }[]
}

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: FullMenuItem
}

export function MenuItemModal({ isOpen, onClose, item }: MenuItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [selectedMods, setSelectedMods] = useState<Record<string, boolean>>({})
  const { addToCart, state } = useCart()

  const handleAddToCart = () => {
    let finalPrice = item.price
    let instructions = specialInstructions ? `Instructions: ${specialInstructions}` : ""
    const mods: string[] = []

    Object.entries(selectedMods).forEach(([modId, isSelected]) => {
      if (isSelected) {
        const mod = item.modifications.find((m) => m.id === modId)
        if (mod) {
          finalPrice += mod.cost
          mods.push(`${mod.label} (+$${mod.cost.toFixed(2)})`)
        }
      }
    })

    if (mods.length > 0) {
      instructions += `\nModifications: ${mods.join(", ")}`
    }

    addToCart({
      id: item.id,
      name: item.name,
      price: finalPrice,
      quantity,
      restaurantId: item.restaurantId,
      image: item.image,
      specialInstructions: instructions.trim(),
    })
    toast.success(`${quantity} x ${item.name} added to cart!`)
    onClose()
  }

  const totalItemPrice = useMemo(() => {
    let basePrice = item.price
    Object.entries(selectedMods).forEach(([modId, isSelected]) => {
      if (isSelected) {
        const mod = item.modifications.find((m) => m.id === modId)
        if (mod) {
          basePrice += mod.cost
        }
      }
    })
    return basePrice * quantity
  }, [item, selectedMods, quantity])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600">{item.description}</p>

          {item.modifications.length > 0 && (
            <div className="space-y-2">
              <Label>Modifications</Label>
              {item.modifications.map((mod) => (
                <div key={mod.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={mod.id}
                    onCheckedChange={(checked) => setSelectedMods((prev) => ({ ...prev, [mod.id]: !!checked }))}
                  />
                  <label
                    htmlFor={mod.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow"
                  >
                    {mod.label}
                  </label>
                  <span className="text-sm text-gray-500">+${mod.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="special-instructions">Special Instructions</Label>
            <Input
              id="special-instructions"
              placeholder="e.g. extra spicy"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart} className="w-full">
            Add {quantity} to cart - ${totalItemPrice.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
