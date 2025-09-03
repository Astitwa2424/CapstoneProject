"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"

interface SSEEvent {
  type: string
  event?: string
  data?: unknown
  room?: string
  timestamp?: number
  userId?: string
}

interface UseSSEReturn {
  isConnected: boolean
  addEventListener: (event: string, handler: (data: unknown) => void) => void
  removeEventListener: (event: string, handler: (data: unknown) => void) => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
  reconnect: () => void
}

export function useSSE(): UseSSEReturn {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const eventListenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map())
  const roomsRef = useRef<Set<string>>(new Set())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  const addEventListener = useCallback((event: string, handler: (data: unknown) => void) => {
    if (!eventListenersRef.current.has(event)) {
      eventListenersRef.current.set(event, new Set())
    }
    eventListenersRef.current.get(event)!.add(handler)
    console.log(`[SSE] Added listener for event: ${event}`)
  }, [])

  const removeEventListener = useCallback((event: string, handler: (data: unknown) => void) => {
    const handlers = eventListenersRef.current.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        eventListenersRef.current.delete(event)
      }
    }
    console.log(`[SSE] Removed listener for event: ${event}`)
  }, [])

  const joinRoom = useCallback(
    (room: string) => {
      roomsRef.current.add(room)
      // Send room join request to server
      if (session?.user?.id) {
        fetch(`/api/sse/rooms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            userId: session.user.id,
            room,
          }),
        }).catch(console.error)
      }
      console.log(`[SSE] Joined room: ${room}`)
    },
    [session?.user?.id],
  )

  const leaveRoom = useCallback(
    (room: string) => {
      roomsRef.current.delete(room)
      // Send room leave request to server
      if (session?.user?.id) {
        fetch(`/api/sse/rooms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "leave",
            userId: session.user.id,
            room,
          }),
        }).catch(console.error)
      }
      console.log(`[SSE] Left room: ${room}`)
    },
    [session?.user?.id],
  )

  const connect = useCallback(() => {
    if (!session?.user?.id || eventSourceRef.current) {
      return
    }

    console.log(`[SSE] Connecting for user: ${session.user.id}`)

    const eventSource = new EventSource(`/api/sse/${session.user.id}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log("[SSE] Connection opened")
      setIsConnected(true)
      reconnectAttemptsRef.current = 0

      // Rejoin all rooms after reconnection
      roomsRef.current.forEach((room) => {
        fetch(`/api/sse/rooms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            userId: session.user.id,
            room,
          }),
        }).catch(console.error)
      })
    }

    eventSource.onmessage = (event) => {
      try {
        const sseEvent: SSEEvent = JSON.parse(event.data)
        console.log("[SSE] Event received:", sseEvent)

        if (sseEvent.type === "event" && sseEvent.event) {
          const handlers = eventListenersRef.current.get(sseEvent.event)
          if (handlers) {
            handlers.forEach((handler) => {
              try {
                handler(sseEvent.data)
              } catch (error) {
                console.error(`[SSE] Error in event handler for ${sseEvent.event}:`, error)
              }
            })
          }
        }
      } catch (error) {
        console.error("[SSE] Error parsing event data:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error)
      setIsConnected(false)

      // Implement exponential backoff for reconnection
      const maxAttempts = 5
      const baseDelay = 1000

      if (reconnectAttemptsRef.current < maxAttempts) {
        const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current)
        console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxAttempts})`)

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          eventSource.close()
          eventSourceRef.current = null
          connect()
        }, delay)
      } else {
        console.error("[SSE] Max reconnection attempts reached")
      }
    }
  }, [session?.user?.id])

  const reconnect = useCallback(() => {
    console.log("[SSE] Manual reconnection requested")
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    reconnectAttemptsRef.current = 0
    setIsConnected(false)
    connect()
  }, [connect])

  useEffect(() => {
    if (session?.user?.id) {
      connect()
    }

    return () => {
      if (eventSourceRef.current) {
        console.log("[SSE] Closing connection")
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      setIsConnected(false)
    }
  }, [session?.user?.id, connect])

  return {
    isConnected,
    addEventListener,
    removeEventListener,
    joinRoom,
    leaveRoom,
    reconnect,
  }
}
