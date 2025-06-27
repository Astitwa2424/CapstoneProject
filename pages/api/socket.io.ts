import { Server as ServerIO } from "socket.io"
import type { NextApiRequest } from "next"
import type { NextApiResponseServerIO } from "@/types/next"
import { setSocketIo } from "@/lib/socket"

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("*First use, initializing socket.io")

    const httpServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: "/api/socket.io",
      addTrailingSlash: false,
    })
    setSocketIo(io)

    io.on("connect", (socket) => {
      socket.on("send-message", (obj) => {
        io.emit("receive-message", obj)
      })
    })

    res.socket.server.io = io
  } else {
    console.log("socket.io already running")
  }
  res.end()
}

export default ioHandler
