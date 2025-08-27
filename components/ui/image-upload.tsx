"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Cloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  label?: string
  description?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  label = "Image",
  description = "Upload an image for your item.",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.")
        return
      }

      const maxSizeInMB = 10
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast.error(`File size must be less than ${maxSizeInMB}MB.`)
        return
      }

      setIsUploading(true)

      try {
        const response = await fetch(`/api/upload-blob?filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upload failed.")
        }

        const newBlob = await response.json()

        onChange(newBlob.url)
        toast.success("Image uploaded successfully!")
      } catch (error) {
        console.error("Upload error:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
        toast.error(`Upload failed: ${errorMessage}`)
      } finally {
        setIsUploading(false)
      }
    },
    [onChange],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
      e.target.value = ""
    },
    [handleFileUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload],
  )

  const removeImage = useCallback(() => {
    onChange("")
    toast.success("Image removed.")
  }, [onChange])

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {value ? (
        <div className="relative">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border">
            <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center space-y-4">
            {isUploading ? (
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            ) : (
              <Cloud className="h-12 w-12 text-muted-foreground" />
            )}
            <div className="space-y-2">
              <p className="text-lg font-medium">{isUploading ? "Uploading..." : "Drop your image here"}</p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP up to 10MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
