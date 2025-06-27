import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = () => {
  if (!socket) {
    socket = io(undefined as any, {
      path: "/api/socket.io",
      addTrailingSlash: false,
    })

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })
  }
  return socket
}

// This is a server-side utility to get the IO server instance
// This is a bit of a hack for Next.js App Router environment
// In a real production app with a custom server, this would be more direct.
import type { Server } from "socket.io"
let ioInstance: Server | null = null
export const setSocketIo = (io: Server) => {
  if (!ioInstance) {
    ioInstance = io
  }
}
export const getSocketIo = () => ioInstance

// We need to update the API route to set the instance
