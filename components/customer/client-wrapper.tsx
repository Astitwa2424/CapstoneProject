"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import SocketNotificationHandler from "./socket-notification-handler"

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const { data: session } = useSession()

  return (
    <>
      {session?.user?.id && <SocketNotificationHandler userId={session.user.id} />}
      {children}
    </>
  )
}
