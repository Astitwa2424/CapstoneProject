"use client"

import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "lucide-react"
import type { MenuItem, RestaurantProfile, Modification } from "@prisma/client"
import { MenuItemModal } from "./menu-item-modal"
import { useState } from "react"

// Extend MenuItem type to include modifications
type MenuItemWithModifications = MenuItem & {
  modifications: Modification[]
}

interface MenuItemCardProps {
  item: MenuItemWithModifications
  restaurant: RestaurantProfile
}

// Using DEFAULT export here to fix the import/export mismatch.
export default function MenuItemCard({ item, restaurant }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const placeholderImage = `/placeholder.svg?height=160&width=300&text=${encodeURIComponent(item.name)}`

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAnimating(true)

    // Reset animation after completion
    setTimeout(() => {
      setIsAnimating(false)
    }, 600)

    // Open modal for customization
    setIsModalOpen(true)
  }

  return (
    <>
      <Card className="flex cursor-pointer flex-col overflow-hidden group" onClick={() => setIsModalOpen(true)}>
        <div className="relative h-40 w-full">
          <Image
            src={item.image || placeholderImage}
            alt={item.name}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (item.image && !target.src.includes("placeholder.svg")) {
                console.log(`Failed to load image for ${item.name}:`, item.image)
              }
              target.src = placeholderImage
            }}
            onLoad={(e) => {
              const target = e.target as HTMLImageElement
              target.style.filter = "none"
            }}
          />
        </div>
        <CardHeader className="flex-1 p-4">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {item.description || "No description available."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between p-4 pt-0">
          <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
          <Button
            size="icon"
            className={`rounded-full transition-all duration-300 ${
              isAnimating ? "animate-bounce scale-110 bg-green-500 hover:bg-green-600" : "hover:scale-105"
            }`}
            onClick={handleAddToCart}
          >
            <PlusIcon className={`h-5 w-5 transition-transform duration-300 ${isAnimating ? "rotate-90" : ""}`} />
            <span className="sr-only">Add to cart</span>
          </Button>
        </CardContent>
      </Card>

      <MenuItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={item} restaurant={restaurant} />
    </>
  )
}
