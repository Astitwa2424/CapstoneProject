"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useSocket } from "@/components/providers"

export default function SocketNotificationHandler() {
  const { data: session } = useSession()
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket || !isConnected || !session?.user?.id) {
      return
    }

    const userRoom = `user_${session.user.id}`
    socket.emit("join-room", userRoom)

    const handleNotification = (data: { title: string; message: string }) => {
      toast.info(data.title, {
        description: data.message,
      })
    }

    socket.on("order_notification", handleNotification)

    return () => {
      socket.off("order_notification", handleNotification)
      socket.emit("leave-room", userRoom)
    }
  }, [socket, isConnected, session?.user?.id])

  return null // This component does not render anything
}
