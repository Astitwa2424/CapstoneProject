import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"
import type { NextApiRequest, NextApiResponse } from "next"
import { Server as IOServer } from "socket.io"
import { setSocketIo } from "@/lib/socket"

interface SocketServer extends HTTPServer {
  io?: IOServer
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function socketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*", methods: ["GET", "POST"] },
    })
    res.socket.server.io = io
    setSocketIo(io)

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`)

      socket.on("join-room", (room) => {
        socket.join(room)
        console.log(`Socket ${socket.id} joined room: ${room}`)
      })

      socket.on("leave-room", (room) => {
        socket.leave(room)
        console.log(`Socket ${socket.id} left room: ${room}`)
      })

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`)
      })
    })
  }
  res.end()
}
