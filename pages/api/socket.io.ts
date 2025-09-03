import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"
import type { NextApiRequest, NextApiResponse } from "next"
import { Server as IOServer } from "socket.io"

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
      path: "/api/socket.io",
      addTrailingSlash: false,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://capstone-project-mu-wine.vercel.app"] // Restricted CORS for production security
            : "*",
        methods: ["GET", "POST"],
      },
      pingTimeout: 120000, // 2 minutes
      pingInterval: 30000, // 30 seconds
      upgradeTimeout: 30000,
      allowEIO3: true,
    })
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`)

      socket.on("join-room", (room) => {
        if (room && typeof room === "string") {
          // Added validation
          socket.join(room)
          console.log(`Socket ${socket.id} joined room: ${room}`)
        }
      })

      socket.on("leave-room", (room) => {
        if (room && typeof room === "string") {
          // Added validation
          socket.leave(room)
          console.log(`Socket ${socket.id} left room: ${room}`)
        }
      })

      socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`)
      })

      socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error)
      })
    })
  }
  res.end()
}
