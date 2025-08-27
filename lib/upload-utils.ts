// Utility functions for handling different upload methods

export async function uploadToVercelBlob(file: File): Promise<string> {
  // This would be used if you have Vercel Blob configured
  // const { put } = await import('@vercel/blob')
  // const blob = await put(file.name, file, { access: 'public' })
  // return blob.url
  throw new Error("Vercel Blob not configured")
}

export async function uploadToCloudinary(file: File): Promise<string> {
  // This would be used if you have Cloudinary configured
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "")

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Cloudinary upload failed")
  }

  const data = await response.json()
  return data.secure_url
}

export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "File must be an image" }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 5MB" }
  }

  return { valid: true }
}
