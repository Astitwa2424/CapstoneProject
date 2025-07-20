"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, LinkIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  className?: string
}

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(value || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageUrl.trim()) {
      setError("Please enter an image URL")
      return
    }

    // Basic URL validation
    try {
      new URL(imageUrl)
    } catch (err) {
      setError("Please enter a valid URL")
      return
    }

    setIsLoading(true)

    // Check if image loads correctly
    const img = new Image()
    img.onload = () => {
      onChange(imageUrl)
      setIsLoading(false)
      toast.success("Image URL added successfully")
    }
    img.onerror = () => {
      setError("Could not load image from this URL")
      setIsLoading(false)
    }
    img.src = imageUrl
  }

  const removeImage = () => {
    onChange("")
    setImageUrl("")
    setError(null)
  }

  return (
    <div className={className}>
      <Label>Food Image URL</Label>

      {value ? (
        <div className="relative mt-2">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border">
            <Image
              src={value || "/placeholder.svg"}
              alt="Food item"
              fill
              className="object-cover"
              onError={(e) => {
                // If image fails to load, show placeholder
                e.currentTarget.src = "/placeholder.svg?height=300&width=400"
              }}
            />
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
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/food-image.jpg"
              value={imageUrl}
              onChange={handleUrlChange}
              disabled={disabled || isLoading}
              className={error ? "border-red-500" : ""}
            />
            <Button type="submit" disabled={disabled || isLoading} variant="secondary">
              <LinkIcon className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-muted-foreground">Enter a direct link to an image (JPG, PNG, GIF)</p>
        </form>
      )}
    </div>
  )
}
