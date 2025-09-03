import type React from "react"
import { auth } from "@/lib/auth"
import { Car, FileText, Home, Package, User, Wallet } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getDriverProfile } from "../../actions"
import { LogoutButton } from "@/components/auth/logout-button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user.role !== "DRIVER") {
    redirect("/unauthorized")
  }

  const driver = await getDriverProfile()
  if (!driver) {
    redirect("/auth/driver/signin")
  }

  const getInitials = (name: string) => {
    const names = name.split(" ")
    const initials = names.map((n) => n[0]).join("")
    return initials.toUpperCase()
  }

  const menuItems = [
    {
      title: "Dashboard",
      url: "/driver/dashboard",
      icon: Home,
    },
    {
      title: "Order History",
      url: "/driver/dashboard/history",
      icon: Package,
    },
    {
      title: "Earnings",
      url: "/driver/dashboard/earnings",
      icon: Wallet,
    },
    {
      title: "Documents",
      url: "/driver/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Account",
      url: "/driver/dashboard/account",
      icon: User,
    },
  ]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Car className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">FoodHub Driver</span>
                    <span className="truncate text-xs">Delivery Platform</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={driver.user.image || ""} alt={driver.user.name || "Driver"} />
                      <AvatarFallback className="rounded-lg">{getInitials(driver.user.name || "")}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{driver.user.name}</span>
                      <span className="truncate text-xs">{driver.user.email}</span>
                    </div>
                    <Badge variant={driver.isOnline ? "default" : "outline"} className="ml-auto">
                      {driver.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={driver.user.image || ""} alt={driver.user.name || "Driver"} />
                        <AvatarFallback className="rounded-lg">{getInitials(driver.user.name || "")}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{driver.user.name}</span>
                        <span className="truncate text-xs">{driver.user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/driver/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <Badge variant={driver.isOnline ? "default" : "outline"}>{driver.isOnline ? "Online" : "Offline"}</Badge>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
