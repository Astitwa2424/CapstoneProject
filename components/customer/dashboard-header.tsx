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
import { useSocket } from "@/components/providers"

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
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (session?.user?.id) {
      setIsLoading(true)
      getActiveOrder(session.user.id).then((order) => {
        setActiveOrder(order)
        setIsLoading(false)
      })
    } else if (session !== undefined) {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (!socket || !session?.user?.id) return

    const userRoom = `user_${session.user.id}`
    socket.emit("join-room", userRoom)

    const handleOrderUpdate = (data: { orderId: string; status: string }) => {
      if (activeOrder && activeOrder.id === data.orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, status: data.status } : null))
      } else if (!activeOrder && data.status !== "DELIVERED" && data.status !== "CANCELLED") {
        // Fetch the new active order if we don't have one
        getActiveOrder(session.user.id).then(setActiveOrder)
      }
    }

    socket.on("order_notification", handleOrderUpdate)

    return () => {
      socket.off("order_notification", handleOrderUpdate)
      socket.emit("leave-room", userRoom)
    }
  }, [socket, session?.user?.id, activeOrder])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-red-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/customer/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">FoodHub</span>
            </Link>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for restaurants or dishes"
                className="pl-12 pr-4 py-3 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-red-300 transition-all text-base rounded-full shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <Skeleton className="h-10 w-36 rounded-full" />
            ) : activeOrder ? (
              <Link href={`/customer/order/${activeOrder.id}/track`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-green-50 border-green-300 text-green-700 hover:bg-green-100 font-semibold shadow-sm rounded-full px-4"
                >
                  <Package className="w-4 h-4" />
                  <span>Track Order</span>
                  <span className="text-xs bg-green-200 px-2 py-0.5 rounded-full">
                    {activeOrder.status.replace("_", " ")}
                  </span>
                </Button>
              </Link>
            ) : null}

            <CartSidebar />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-red-200 transition-all"
                >
                  <Avatar className="h-9 w-9 shadow-md">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="bg-red-500 text-white font-semibold">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-white border-gray-200 shadow-xl rounded-2xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-gray-900">{session?.user?.name || "User"}</p>
                    <p className="text-xs leading-none text-gray-600">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/customer/profile"
                    className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg mx-2"
                  >
                    <User className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="text-gray-900">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/customer/profile/orders"
                    className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg mx-2"
                  >
                    <Clock className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="text-gray-900">Order History</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/customer/profile/payment"
                    className="flex items-center cursor-pointer p-3 hover:bg-gray-50 rounded-lg mx-2"
                  >
                    <CreditCard className="mr-3 h-4 w-4 text-gray-600" />
                    <span className="text-gray-900">Payment Methods</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer p-3 hover:bg-red-50 rounded-lg mx-2 mb-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
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
