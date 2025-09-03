import type { NextApiRequest, NextApiResponse } from "next"
import { joinSSERoom, leaveSSERoom } from "./[userId]"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const { action, userId, room } = req.body

    if (!action || !userId || !room) {
      return res.status(400).json({ message: "Missing required fields: action, userId, room" })
    }

    let success = false

    if (action === "join") {
      success = joinSSERoom(userId, room)
    } else if (action === "leave") {
      success = leaveSSERoom(userId, room)
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'join' or 'leave'" })
    }

    res.status(200).json({
      success,
      message: `User ${success ? "successfully" : "failed to"} ${action} room: ${room}`,
    })
  } catch (error) {
    console.error("Error in SSE rooms API:", error)
    res.status(500).json({ success: false, error: "Failed to manage room" })
  }
}
