"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Clock, CreditCard, MapPin, Shield, Settings, Bell, ArrowLeft, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    href: "/customer/profile",
    label: "Profile Information",
    icon: User,
  },
  {
    href: "/customer/profile/orders",
    label: "Order History",
    icon: Clock,
  },
  {
    href: "/customer/profile/payment",
    label: "Payment Methods",
    icon: CreditCard,
  },
  {
    href: "/customer/profile/addresses",
    label: "Addresses",
    icon: MapPin,
  },
  {
    href: "/customer/profile/security",
    label: "Security Settings",
    icon: Shield,
  },
  {
    href: "/customer/profile/preferences",
    label: "Preferences",
    icon: Settings,
  },
]

export default function CustomerProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/customer/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/customer/dashboard">
                <h1 className="text-2xl font-bold text-red-500">FoodHub</h1>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  1
                </Badge>
              </Button>

              {session?.user && (
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session.user.image || "/placeholder.svg?height=32&width=32"} />
                    <AvatarFallback>{session.user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{session.user.name || "Nis kha"}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                  </div>
                </div>
              )}

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className={cn("w-64 space-y-2 md:block", sidebarOpen ? "block" : "hidden")}>
            <Card className="p-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-red-50 text-red-600 border-r-2 border-red-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
