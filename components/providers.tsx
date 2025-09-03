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
      path: "/api/socket.io",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5, // Reduced from 10 to prevent excessive retries
      reconnectionDelay: 2000, // Increased initial delay
      reconnectionDelayMax: 10000, // Increased max delay
      timeout: 30000, // Increased timeout
      forceNew: false, // Allow connection reuse
      transports: ["websocket", "polling"], // Explicit transport fallback
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setIsConnected(false)
    })

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts")
      setIsConnected(true)
    })

    socketInstance.on("reconnect_error", (error) => {
      console.error("Socket reconnection failed:", error)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
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
