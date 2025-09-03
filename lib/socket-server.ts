"use server"
import "server-only"

/**
 * Emits a socket.io event by sending a POST request to our own internal API route.
 * This is the recommended way to trigger socket events from Server Actions
 * or other server-side code in a serverless environment.
 * @param room - The room to emit the event to (e.g., a restaurantId or a user-specific room like `user-userId`).
 * @param event - The name of the event.
 * @param data - The payload to send with the event.
 */
export async function emitSocketEvent(room: string, event: string, data: unknown) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://capstone-project-mu-wine.vercel.app"
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const url = new URL("/api/notify", baseUrl)

  try {
    // Use fetch to send a request to our own API route.
    // This decouples the Server Action from the stateful WebSocket server.
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add a secret header to secure the endpoint
        "X-Internal-Secret": process.env.INTERNAL_SECRET_KEY || "super-secret-key-for-dev",
      },
      body: JSON.stringify({ room, event, data }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to emit socket event: ${response.status} ${errorText}`)
    } else {
      console.log(`✅ Socket event '${event}' emitted to room '${room}'`)
    }
  } catch (error) {
    console.error("Error emitting socket event:", error)
  }
}

/**
 * Convenience function to emit events to a restaurant-specific room.
 * @param restaurantId - The restaurant ID to emit the event to.
 * @param event - The name of the event.
 * @param data - The payload to send with the event.
 */
export async function emitToRestaurant(restaurantId: string, event: string, data: unknown) {
  await emitSocketEvent(restaurantId, event, data)
}
