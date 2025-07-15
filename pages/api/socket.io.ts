import { Server as ServerIO } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponseServerIO } from "@/types/next"

// This file now handles the SERVER-SIDE socket instance.
const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("*First use, initializing socket.io server")

    const httpServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: "/api/socket.io",
      addTrailingSlash: false,
      cors: {
        origin: "*", // In production, restrict this to your domain
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log(`🔌 New client connected on server: ${socket.id}`)

      socket.on("join-restaurant-room", (restaurantId: string) => {
        socket.join(restaurantId)
        console.log(`Client ${socket.id} joined room for restaurant ${restaurantId}`)
      })

      socket.on("disconnect", () => {
        console.log(`🔥 Client disconnected from server: ${socket.id}`)
      })
    })

    res.socket.server.io = io
  } else {
    console.log("socket.io server already running")
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default ioHandler
