"use client"

import type React from "react"

import { CartProvider } from "@/hooks/use-cart"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster richColors />
      </CartProvider>
    </SessionProvider>
  )
}
