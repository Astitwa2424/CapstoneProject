"use client"

import { CartProvider } from "@/hooks/use-cart"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { io, type Socket } from "socket.io-client"

// --- Socket Context ---
interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  const context = React.useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = React.useState<Socket | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    const socketInstance = io({
      path: "/api/socket",
      addTrailingSlash: false,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

// --- Theme Provider ---
function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// --- Main Providers Component ---
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </CartProvider>
      </SocketProvider>
    </SessionProvider>
  )
}
