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

  try {
    const { type, orderId, restaurantId, order } = req.body

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

    if (type === "new_order") {
      // Emit to restaurant-specific room
      io.to(`restaurant-${restaurantId}`).emit("new_order", {
        orderId,
        order,
        timestamp: new Date().toISOString(),
      })

      // Also emit to general restaurant dashboard room
      io.to("restaurant-dashboard").emit("order_update", {
        type: "new_order",
        orderId,
        restaurantId,
        order,
        timestamp: new Date().toISOString(),
      })

      console.log(`Notified restaurant ${restaurantId} about new order ${orderId}`)
    }

    res.status(200).json({ success: true, message: "Notification sent" })
  } catch (error) {
    console.error("Error in notify API:", error)
    res.status(500).json({ success: false, error: "Failed to send notification" })
  }
}
