"use client"

import type { Server } from "socket.io"

// --- Server-side Socket Instance Management ---
// This part is for your API routes to access and emit events.
let ioInstance: Server | null = null

export const setSocketIo = (io: Server) => {
  if (!ioInstance) {
    ioInstance = io
    console.log("Socket.IO server instance has been set.")
  }
}

export const getSocketIo = (): Server | null => {
  if (!ioInstance) {
    // This is a common scenario in dev with hot-reloading, so a warning is better than an error.
    console.warn("getSocketIo called before Socket.IO server was initialized.")
  }
  return ioInstance
}

export const emitToRoom = (room: string, event: string, data: any) => {
  const io = getSocketIo()
  if (io) {
    io.to(room).emit(event, data)
    console.log(`Emitted '${event}' to room '${room}'`)
  } else {
    console.error(`Could not emit '${event}' to room '${room}': Socket.IO server instance not available.`)
  }
}
