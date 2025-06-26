import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For now, let's disable middleware to avoid conflicts
  // The auth checks are handled in the page components directly
  console.log("🛡️ Middleware bypassed for:", request.nextUrl.pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
