"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { usePolling } from "@/components/customer/polling-provider"
import { useState } from "react"

interface RefreshButtonProps {
  onRefresh?: () => void
  className?: string
}

export function RefreshButton({ onRefresh, className }: RefreshButtonProps) {
  const { forceRefresh } = usePolling()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      if (onRefresh) {
        await onRefresh()
      }
      forceRefresh()
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className={className}>
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </Button>
  )
}
