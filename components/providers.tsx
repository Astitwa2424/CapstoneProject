"use client"

import { CartProvider } from "@/hooks/use-cart"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"

// --- SSE Context ---
interface SSEContextType {
  isConnected: boolean
  usePollingFallback: boolean
  emit: (event: string, data: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback: (data: any) => void) => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
}

const SSEContext = React.createContext<SSEContextType>({
  isConnected: false,
  usePollingFallback: false,
  emit: () => {},
  on: () => {},
  off: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
})

export const useSocket = () => {
  const context = React.useContext(SSEContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SSEProvider")
  }
  return context
}

function SSEProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = React.useState(false)
  const [usePollingFallback, setUsePollingFallback] = React.useState(false)
  const [eventSource, setEventSource] = React.useState<EventSource | null>(null)
  const [userId, setUserId] = React.useState<string | null>(null)
  const eventListeners = React.useRef<Map<string, Set<(data: any) => void>>>(new Map())
  const connectionAttemptsRef = React.useRef(0)
  const maxConnectionAttempts = 3

  React.useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const session = await response.json()
        if (session?.user?.id) {
          setUserId(session.user.id)
        }
      } catch (error) {
        console.error("Failed to get user session:", error)
        setUsePollingFallback(true)
      }
    }
    getUserId()
  }, [])

  React.useEffect(() => {
    if (!userId || usePollingFallback) {
      if (usePollingFallback) {
        console.log("✅ Polling fallback system activated - real-time updates will use periodic polling")
      }
      return
    }

    const connectSSE = () => {
      try {
        const es = new EventSource(`/api/sse/${userId}`)

        es.onopen = () => {
          console.log("SSE connected for user:", userId)
          setIsConnected(true)
          connectionAttemptsRef.current = 0
        }

        es.onerror = (error) => {
          console.error("SSE connection error:", error)
          setIsConnected(false)
          connectionAttemptsRef.current++

          if (connectionAttemptsRef.current >= maxConnectionAttempts) {
            console.log("Max SSE connection attempts reached, switching to polling fallback")
            setUsePollingFallback(true)
            es.close()
          }
        }

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            const { event: eventName, data: eventData } = data

            const listeners = eventListeners.current.get(eventName)
            if (listeners) {
              listeners.forEach((callback) => callback(eventData))
            }
          } catch (error) {
            console.error("Failed to parse SSE message:", error)
          }
        }

        setEventSource(es)
      } catch (error) {
        console.error("Failed to create SSE connection:", error)
        setUsePollingFallback(true)
      }
    }

    connectSSE()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [userId, usePollingFallback])

  const emit = React.useCallback((event: string, data: any) => {
    // SSE is one-way, so emit functionality is handled server-side
    console.log("SSE emit (server-side only):", event, data)
  }, [])

  const on = React.useCallback((event: string, callback: (data: any) => void) => {
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set())
    }
    eventListeners.current.get(event)!.add(callback)
  }, [])

  const off = React.useCallback((event: string, callback: (data: any) => void) => {
    const listeners = eventListeners.current.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }, [])

  const joinRoom = React.useCallback(
    async (room: string) => {
      if (!userId) return
      try {
        await fetch("/api/sse/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, room, action: "join" }),
        })
      } catch (error) {
        console.error("Failed to join room:", error)
      }
    },
    [userId],
  )

  const leaveRoom = React.useCallback(
    async (room: string) => {
      if (!userId) return
      try {
        await fetch("/api/sse/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, room, action: "leave" }),
        })
      } catch (error) {
        console.error("Failed to leave room:", error)
      }
    },
    [userId],
  )

  return (
    <SSEContext.Provider
      value={{
        isConnected,
        usePollingFallback,
        emit,
        on,
        off,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SSEContext.Provider>
  )
}

// --- Theme Provider ---
function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// --- Main Providers Component ---
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SSEProvider>
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </CartProvider>
      </SSEProvider>
    </SessionProvider>
  )
}
