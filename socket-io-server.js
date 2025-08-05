import { createServer } from "http"
import { Server } from "socket.io"
import express from "express"
import bodyParser from "body-parser"

const app = express()
const httpServer = createServer(app)

// In production, you should restrict the origin to your app's URL
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

app.use(bodyParser.json())

// --- Socket.IO Connection Handling ---
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`)

  socket.on("join-room", (room) => {
    if (room) {
      socket.join(room)
      console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`)
    }
  })

  socket.on("leave-room", (room) => {
    if (room) {
      socket.leave(room)
      console.log(`[Socket.IO] Socket ${socket.id} left room: ${room}`)
    }
  })

  socket.on("disconnect", (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}. Reason: ${reason}`)
  })
})

// --- Internal API for Next.js to emit events ---
// This allows your serverless Next.js actions to trigger real-time events
app.post("/api/notify", (req, res) => {
  const { room, event, data } = req.body
  if (room && event) {
    io.to(room).emit(event, data)
    console.log(`[HTTP Notify] Emitted event '${event}' to room '${room}'`)
    return res.status(200).json({ success: true, message: `Event '${event}' emitted to room '${room}'.` })
  }
  return res.status(400).json({ success: false, message: 'Request body must include "room", "event".' })
})

const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.IO server with notification endpoint is running on http://localhost:${PORT}`)
})
