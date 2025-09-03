import type { NextApiRequest, NextApiResponse } from "next"
import { emitSSEEvent } from "./[userId]"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  // Verify internal secret for security
  const internalSecret = req.headers["x-internal-secret"]
  if (internalSecret !== (process.env.INTERNAL_SECRET_KEY || "super-secret-key-for-dev")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { room, event, data } = req.body

    if (!room || !event) {
      return res.status(400).json({ message: "Missing required fields: room, event" })
    }

    console.log(`[SSE] Emitting event "${event}" to room "${room}"`, data)

    const connectionCount = emitSSEEvent(room, event, data)

    res.status(200).json({
      success: true,
      message: "Event emitted successfully",
      connectionCount,
    })
  } catch (error) {
    console.error("Error in SSE emit API:", error)
    res.status(500).json({ success: false, error: "Failed to emit event" })
  }
}
