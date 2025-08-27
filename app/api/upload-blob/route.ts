import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "No filename provided" }, { status: 400 })
  }

  // Check for user authentication
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!request.body) {
    return NextResponse.json({ error: "No file body provided" }, { status: 400 })
  }

  try {
    const bytes = await request.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, uniqueFilename)

    await writeFile(filePath, buffer)

    // Return response in same format as Vercel Blob
    const url = `/uploads/${uniqueFilename}`

    return NextResponse.json({
      url: url,
      downloadUrl: url,
      pathname: uniqueFilename,
      contentType: request.headers.get("content-type") || "application/octet-stream",
      contentDisposition: `attachment; filename="${filename}"`,
      size: buffer.length,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
