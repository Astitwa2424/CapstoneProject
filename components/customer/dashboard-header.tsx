"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, User, LogOut, CreditCard, Clock, Package } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { CartSidebar } from "./cart-sidebar"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

type ActiveOrder = {
  id: string
  status: string
  restaurant: {
    name: string
  }
} | null

async function getActiveOrder(userId: string): Promise<ActiveOrder> {
  try {
    const response = await fetch(`/api/customer/active-order?userId=${userId}`)
    if (response.ok) {
      const data = await response.json()
      return data.activeOrder
    }
  } catch (error) {
    console.error("[Header] Failed to fetch active order:", error)
  }
  return null
}

export default function DashboardHeader() {
  const { data: session } = useSession()
  const [activeOrder, setActiveOrder] = useState<ActiveOrder>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      setIsLoading(true)
      getActiveOrder(session.user.id).then((order) => {
        setActiveOrder(order)
        setIsLoading(false)
      })
    } else if (session !== undefined) {
      // Only stop loading if session is loaded (even if null)
      setIsLoading(false)
    }
  }, [session])

  // Refresh active order status every 30 seconds
  useEffect(() => {
    if (!session?.user?.id) return

    const interval = setInterval(() => {
      getActiveOrder(session.user.id).then((order) => {
        setActiveOrder(order)
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [session?.user?.id])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/customer/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">FoodHub</span>
            </Link>
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input type="text" placeholder="Search for restaurants or dishes" className="pl-10 pr-4 py-2 w-full" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <Skeleton className="h-9 w-32 rounded-md" />
            ) : activeOrder ? (
              <Link href={`/customer/order/${activeOrder.id}/track`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-green-50 border-green-300 text-green-800 hover:bg-green-100 font-semibold animate-pulse"
                >
                  <Package className="w-4 h-4" />
                  <span>Track Order</span>
                  <span className="text-xs bg-green-200 px-1 rounded">{activeOrder.status.replace("_", " ")}</span>
                </Button>
              </Link>
            ) : null}

            <CartSidebar />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/customer/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customer/profile/orders" className="flex items-center cursor-pointer">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customer/profile/payment" className="flex items-center cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Payment Methods</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
