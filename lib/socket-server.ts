"use server"
import "server-only"

/**
 * Emits a Server-Sent Event by sending a POST request to our SSE emit endpoint.
 * This replaces the Socket.IO implementation with SSE for better Vercel compatibility.
 * @param room - The room to emit the event to (e.g., user_userId, restaurant_restaurantId).
 * @param event - The name of the event.
 * @param data - The payload to send with the event.
 */
export async function emitSocketEvent(room: string, event: string, data: unknown) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://capstone-project-mu-wine.vercel.app"
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const url = new URL("/api/sse/emit", baseUrl)

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": process.env.INTERNAL_SECRET_KEY || "super-secret-key-for-dev",
      },
      body: JSON.stringify({ room, event, data }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to emit SSE event: ${response.status} ${errorText}`)
    } else {
      const result = await response.json()
      console.log(`✅ SSE event '${event}' emitted to room '${room}' (${result.connectionCount} connections)`)
    }
  } catch (error) {
    console.error("Error emitting SSE event:", error)
  }
}

/**
 * Convenience function to emit events to a restaurant-specific room.
 * @param restaurantId - The restaurant ID to emit the event to.
 * @param event - The name of the event.
 * @param data - The payload to send with the event.
 */
export async function emitToRestaurant(restaurantId: string, event: string, data: unknown) {
  await emitSocketEvent(`restaurant_${restaurantId}`, event, data)
}
