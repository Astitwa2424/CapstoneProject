import { PrismaClient } from "@prisma/client"

// This setup prevents creating too many Prisma Client instances in development
// due to Next.js hot-reloading, which can exhaust your database connection pool.

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  // This allows us to store the prisma client on the global object in development
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export { prisma }

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma
}
