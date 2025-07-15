"use client"

import type { MenuItem, Modification } from "@prisma/client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"

// --- TYPES ---

export interface CartItem {
  id: string // Unique ID for the cart item instance
  menuItem: MenuItem & {
    restaurant: { id: string; name: string }
  }
  quantity: number
  selectedModifications: Modification[]
  specialInstructions?: string
  totalPrice: number
}

interface CartState {
  items: CartItem[]
  restaurantId: string | null
}

interface CartTotals {
  subtotal: number
  deliveryFee: number
  serviceFee: number
  total: number
}

interface CartContextType {
  items: CartItem[]
  restaurantId: string | null
  addToCart: (item: Omit<CartItem, "id" | "totalPrice">) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getCartSubtotal: () => number
  getCartTotals: () => CartTotals
}

// --- CONTEXT ---

const CartContext = createContext<CartContextType | undefined>(undefined)

// --- PROVIDER ---

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartState, setCartState] = useState<CartState>({ items: [], restaurantId: null })

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("foodhub-cart-simplified")
      if (storedCart) {
        setCartState(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error)
      localStorage.removeItem("foodhub-cart-simplified")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("foodhub-cart-simplified", JSON.stringify(cartState))
  }, [cartState])

  const calculateItemPrice = (basePrice: number, selectedMods: Modification[]): number => {
    return selectedMods.reduce((total, mod) => total + (mod.cost || 0), basePrice)
  }

  const addToCart: CartContextType["addToCart"] = (newItem) => {
    const newRestaurantId = newItem.menuItem.restaurant.id

    if (cartState.restaurantId && cartState.restaurantId !== newRestaurantId) {
      toast.error("You can only order from one restaurant at a time.", {
        description: "Please clear your cart to add items from this restaurant.",
        action: {
          label: "Clear Cart",
          onClick: () => clearAndAddItem(newItem),
        },
      })
      return
    }

    const itemPrice = calculateItemPrice(newItem.menuItem.price, newItem.selectedModifications)
    const itemToAdd: CartItem = {
      ...newItem,
      id: crypto.randomUUID(),
      totalPrice: itemPrice * newItem.quantity,
    }

    setCartState((prevState) => ({
      items: [...prevState.items, itemToAdd],
      restaurantId: newRestaurantId,
    }))

    toast.success(`${newItem.menuItem.name} added to cart!`)
  }

  const clearAndAddItem = (item: Omit<CartItem, "id" | "totalPrice">) => {
    const itemPrice = calculateItemPrice(item.menuItem.price, item.selectedModifications)
    const itemToAdd: CartItem = {
      ...item,
      id: crypto.randomUUID(),
      totalPrice: itemPrice * item.quantity,
    }
    setCartState({
      items: [itemToAdd],
      restaurantId: item.menuItem.restaurant.id,
    })
    toast.success(`Cart cleared and ${item.menuItem.name} added!`)
  }

  const removeFromCart: CartContextType["removeFromCart"] = (cartItemId) => {
    setCartState((prevState) => {
      const newItems = prevState.items.filter((item) => item.id !== cartItemId)
      return {
        items: newItems,
        restaurantId: newItems.length > 0 ? prevState.restaurantId : null,
      }
    })
    toast.info("Item removed from cart.")
  }

  const updateQuantity: CartContextType["updateQuantity"] = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
      return
    }
    setCartState((prevState) => ({
      ...prevState,
      items: prevState.items.map((item) => {
        if (item.id === cartItemId) {
          const baseItemPrice = item.totalPrice / item.quantity
          return { ...item, quantity, totalPrice: baseItemPrice * quantity }
        }
        return item
      }),
    }))
  }

  const clearCart: CartContextType["clearCart"] = () => {
    setCartState({ items: [], restaurantId: null })
    toast.info("Cart has been cleared.")
  }

  const getItemCount: CartContextType["getItemCount"] = () => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartSubtotal: CartContextType["getCartSubtotal"] = () => {
    return cartState.items.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getCartTotals: CartContextType["getCartTotals"] = () => {
    const subtotal = getCartSubtotal()
    const deliveryFee = subtotal > 0 ? 5.99 : 0
    const serviceFee = subtotal > 0 ? 2.99 : 0
    const total = subtotal + deliveryFee + serviceFee
    return { subtotal, deliveryFee, serviceFee, total }
  }

  const value = {
    items: cartState.items,
    restaurantId: cartState.restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getCartSubtotal,
    getCartTotals,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// --- HOOK ---

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
