"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface PollingContextType {
  isPolling: boolean
  lastUpdate: Date | null
  forceRefresh: () => void
}

const PollingContext = createContext<PollingContextType>({
  isPolling: false,
  lastUpdate: null,
  forceRefresh: () => {},
})

export function PollingProvider({ children }: { children: React.ReactNode }) {
  const [isPolling, setIsPolling] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const pathname = usePathname()

  // Auto-polling for critical pages
  useEffect(() => {
    const isCriticalPage =
      pathname?.includes("/track") || pathname?.includes("/orders") || pathname?.includes("/dashboard")

    if (!isCriticalPage) return

    setIsPolling(true)

    // Poll every 30 seconds as backup to socket events
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      setRefreshTrigger((prev) => prev + 1)

      // Trigger custom event for components to refresh data
      window.dispatchEvent(
        new CustomEvent("polling-refresh", {
          detail: { timestamp: new Date() },
        }),
      )
    }, 30000)

    return () => {
      clearInterval(interval)
      setIsPolling(false)
    }
  }, [pathname])

  const forceRefresh = () => {
    setLastUpdate(new Date())
    setRefreshTrigger((prev) => prev + 1)
    window.dispatchEvent(
      new CustomEvent("force-refresh", {
        detail: { timestamp: new Date() },
      }),
    )
  }

  return <PollingContext.Provider value={{ isPolling, lastUpdate, forceRefresh }}>{children}</PollingContext.Provider>
}

export const usePolling = () => useContext(PollingContext)
