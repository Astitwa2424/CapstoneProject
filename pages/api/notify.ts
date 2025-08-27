import type { NextApiRequest, NextApiResponse } from "next"
import { Server as SocketIOServer } from "socket.io"
import type { Server as NetServer } from "http"

interface SocketServer extends NetServer {
  io?: SocketIOServer
}

interface SocketWithIO extends NextApiResponse {
  socket: {
    server: SocketServer
  }
}

export default function handler(req: NextApiRequest, res: SocketWithIO) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const internalSecret = req.headers["x-internal-secret"]
  if (internalSecret !== (process.env.INTERNAL_SECRET_KEY || "super-secret-key-for-dev")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { room, event, data } = req.body

    if (!room || !event) {
      return res.status(400).json({ message: "Missing required fields: room, event" })
    }

    // Initialize Socket.IO if not already done
    if (!res.socket.server.io) {
      console.log("Initializing Socket.IO server...")
      const io = new SocketIOServer(res.socket.server, {
        path: "/api/socket.io",
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      })
      res.socket.server.io = io
    }

    const io = res.socket.server.io

    console.log(`Emitting event "${event}" to room "${room}"`, data)
    io.to(room).emit(event, data)

    res.status(200).json({ success: true, message: "Event emitted successfully" })
  } catch (error) {
    console.error("Error in notify API:", error)
    res.status(500).json({ success: false, error: "Failed to emit event" })
  }
}
