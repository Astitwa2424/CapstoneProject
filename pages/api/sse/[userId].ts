import type { NextApiRequest, NextApiResponse } from "next"

interface SSEConnection {
  userId: string
  res: NextApiResponse
  rooms: Set<string>
}

// Store active SSE connections
const connections = new Map<string, SSEConnection>()

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { userId } = req.query
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ message: "User ID is required" })
  }

  // Set up SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  })

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`)

  // Store connection
  const connection: SSEConnection = {
    userId,
    res,
    rooms: new Set([`user_${userId}`]), // Default user room
  }
  connections.set(userId, connection)

  console.log(`[SSE] User ${userId} connected. Active connections: ${connections.size}`)

  // Handle client disconnect
  req.on("close", () => {
    connections.delete(userId)
    console.log(`[SSE] User ${userId} disconnected. Active connections: ${connections.size}`)
  })

  // Keep connection alive with periodic heartbeat
  const heartbeat = setInterval(() => {
    if (connections.has(userId)) {
      res.write(`data: ${JSON.stringify({ type: "heartbeat", timestamp: Date.now() })}\n\n`)
    } else {
      clearInterval(heartbeat)
    }
  }, 30000) // 30 seconds

  // Clean up on connection close
  req.on("close", () => {
    clearInterval(heartbeat)
  })
}

// Function to emit events to specific users or rooms
export function emitSSEEvent(room: string, event: string, data: unknown) {
  let targetConnections: SSEConnection[] = []

  if (room.startsWith("user_")) {
    const userId = room.replace("user_", "")
    const connection = connections.get(userId)
    if (connection) {
      targetConnections = [connection]
    }
  } else if (room.startsWith("restaurant_")) {
    // Find all connections that have joined this restaurant room
    targetConnections = Array.from(connections.values()).filter((conn) => conn.rooms.has(room))
  } else if (room.startsWith("drivers_")) {
    // Find all driver connections
    targetConnections = Array.from(connections.values()).filter((conn) => conn.rooms.has(room))
  } else if (room.startsWith("order_")) {
    // Find all connections that have joined this order room
    targetConnections = Array.from(connections.values()).filter((conn) => conn.rooms.has(room))
  }

  // Send event to target connections
  targetConnections.forEach((connection) => {
    try {
      const eventData = {
        type: "event",
        event,
        data,
        room,
        timestamp: Date.now(),
      }
      connection.res.write(`data: ${JSON.stringify(eventData)}\n\n`)
      console.log(`[SSE] Event '${event}' sent to user ${connection.userId} in room '${room}'`)
    } catch (error) {
      console.error(`[SSE] Failed to send event to user ${connection.userId}:`, error)
      // Remove broken connection
      connections.delete(connection.userId)
    }
  })

  return targetConnections.length
}

// Function to add user to additional rooms
export function joinSSERoom(userId: string, room: string) {
  const connection = connections.get(userId)
  if (connection) {
    connection.rooms.add(room)
    console.log(`[SSE] User ${userId} joined room: ${room}`)
    return true
  }
  return false
}

// Function to remove user from rooms
export function leaveSSERoom(userId: string, room: string) {
  const connection = connections.get(userId)
  if (connection) {
    connection.rooms.delete(room)
    console.log(`[SSE] User ${userId} left room: ${room}`)
    return true
  }
  return false
}
