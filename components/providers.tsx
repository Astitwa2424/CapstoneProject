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
  usePollingFallback: boolean
}

const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  usePollingFallback: false,
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
  const [usePollingFallback, setUsePollingFallback] = React.useState(false)
  const connectionAttemptsRef = React.useRef(0)
  const maxConnectionAttempts = 3

  React.useEffect(() => {
    if (usePollingFallback) {
      console.log("Using polling fallback, skipping socket connection")
      return
    }

    const socketInstance = io({
      path: "/api/socket.io",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: maxConnectionAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id)
      setIsConnected(true)
      connectionAttemptsRef.current = 0
    })

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setIsConnected(false)
    })

    socketInstance.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts")
      setIsConnected(true)
      connectionAttemptsRef.current = 0
    })

    socketInstance.on("reconnect_error", (error) => {
      console.error("Socket reconnection failed:", error)
      connectionAttemptsRef.current++

      if (connectionAttemptsRef.current >= maxConnectionAttempts) {
        console.log("Max reconnection attempts reached, switching to polling fallback")
        setUsePollingFallback(true)
        socketInstance.disconnect()
      }
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setIsConnected(false)
      connectionAttemptsRef.current++

      if (connectionAttemptsRef.current >= maxConnectionAttempts) {
        console.log("Max connection attempts reached, switching to polling fallback")
        setUsePollingFallback(true)
        socketInstance.disconnect()
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [usePollingFallback])

  React.useEffect(() => {
    if (usePollingFallback) {
      console.log("✅ Polling fallback system activated - real-time updates will use periodic polling")
    }
  }, [usePollingFallback])

  return <SocketContext.Provider value={{ socket, isConnected, usePollingFallback }}>{children}</SocketContext.Provider>
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
