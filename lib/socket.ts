import { io, type Socket } from "socket.io-client"
import type { Server } from "socket.io"

let socket: Socket | null = null
let ioInstance: Server | null = null

// Client-side socket instance
export const getSocket = () => {
  if (!socket) {
    // The `as any` is a workaround for the server/client environment detection in Next.js
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

// Server-side socket instance management
export const setSocketIo = (io: Server) => {
  if (!ioInstance) {
    ioInstance = io
  }
}

export const getSocketIo = () => {
  if (!ioInstance) {
    console.error("Socket.IO server instance has not been initialized.")
    // In a real app, you might throw an error or have a more robust way
    // to ensure the instance is available.
  }
  return ioInstance
}

// Server-side emitter function
export const emitToRestaurant = (restaurantId: string, event: string, data: any) => {
  const io = getSocketIo()
  if (io) {
    io.to(restaurantId).emit(event, data)
    console.log(`Emitted '${event}' to room ${restaurantId}`)
  } else {
    console.error(`Could not emit '${event}' to room ${restaurantId}: Socket.IO not available.`)
  }
}
