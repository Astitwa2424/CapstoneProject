"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSocket } from "@/lib/socket"
import { toast } from "sonner"
import type { OrderStatus } from "@prisma/client"

interface SocketNotificationHandlerProps {
  userId?: string
}

export default function SocketNotificationHandler({ userId }: SocketNotificationHandlerProps) {
  const router = useRouter()

  useEffect(() => {
    if (!userId) return

    const socket = getSocket()
    if (!socket) return

    // Join a room specific to this user
    socket.emit("join-user-room", userId)

    const handleNotification = (data: { orderId: string; status: OrderStatus; message: string }) => {
      console.log("Received order notification:", data)
      toast.info(data.message, {
        action: {
          label: "Track Order",
          onClick: () => router.push(`/customer/order/${data.orderId}/track`),
        },
        duration: 10000, // Keep toast visible for 10 seconds
      })
    }

    socket.on("order_notification", handleNotification)

    return () => {
      socket.off("order_notification", handleNotification)
    }
  }, [userId, router])

  return null // This component does not render anything
}
