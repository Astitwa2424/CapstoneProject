"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2, Copy, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { MenuItem } from "@prisma/client"

interface MenuItemCardProps {
  item: MenuItem
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  onDuplicate: (item: MenuItem) => void
  disabled?: boolean
}

export function MenuItemCard({ item, onDelete, onToggleActive, onDuplicate, disabled = false }: MenuItemCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getDietaryBadges = () => {
    const badges = []
    if (item.isVegetarian) badges.push({ label: "Vegetarian", variant: "secondary" as const })
    if (item.isVegan) badges.push({ label: "Vegan", variant: "secondary" as const })
    if (item.isGlutenFree) badges.push({ label: "Gluten Free", variant: "secondary" as const })
    return badges
  }

  const getSpicyLevel = () => {
    if (!item.spicyLevel || item.spicyLevel === 0) return null
    return "🌶️".repeat(Math.min(item.spicyLevel, 5))
  }

  return (
    <Card className={`h-full flex flex-col ${!item.isActive ? "opacity-60" : ""}`}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {item.image ? (
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            {!item.isActive && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <EyeOff className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
            {item.isActive && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Eye className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
            <span className="text-lg font-bold text-primary">{formatPrice(item.price)}</span>
          </div>

          {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}

          <div className="flex flex-wrap gap-1">
            {item.category && <Badge variant="outline">{item.category}</Badge>}
            {getDietaryBadges().map((badge, index) => (
              <Badge key={index} variant={badge.variant}>
                {badge.label}
              </Badge>
            ))}
            {getSpicyLevel() && <Badge variant="outline">{getSpicyLevel()}</Badge>}
          </div>

          {item.allergens && Array.isArray(item.allergens) && item.allergens.length > 0 && (
            <div className="text-xs text-orange-600">
              <strong>Allergens:</strong> {item.allergens.join(", ")}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium">Active</span>
          <Switch
            checked={item.isActive}
            onCheckedChange={(checked) => onToggleActive(item.id, checked)}
            disabled={disabled}
          />
        </div>

        <div className="flex gap-2 w-full">
          <Link href={`/restaurant/dashboard/menu/${item.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent" disabled={disabled}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={() => onDuplicate(item)} disabled={disabled}>
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
            disabled={disabled}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
