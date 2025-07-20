"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Link, X } from "lucide-react"
import { toast } from "sonner"

interface BannerImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function BannerImageUpload({ value, onChange, disabled }: BannerImageUploadProps) {
  const [urlInput, setUrlInput] = useState("")

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter an image URL")
      return
    }

    // Basic URL validation
    try {
      new URL(urlInput.trim())
      onChange(urlInput.trim())
      setUrlInput("")
      toast.success("Banner image URL added successfully!")
    } catch {
      toast.error("Please enter a valid URL")
    }
  }

  const handleRemove = () => {
    onChange("")
    toast.success("Banner image removed")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUrlSubmit()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="banner-url">Banner Image URL</Label>
        <p className="text-sm text-muted-foreground">Paste the URL of your restaurant banner image</p>
      </div>

      {/* Current Image Preview */}
      {value && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Banner</span>
              <Button type="button" variant="outline" size="sm" onClick={handleRemove} disabled={disabled}>
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
            <div className="relative h-20 bg-gray-100 rounded-lg overflow-hidden border">
              <img
                src={value || "/placeholder.svg"}
                alt="Banner preview"
                className="w-full h-full object-cover"
                onError={() => {
                  toast.error("Failed to load image from URL")
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Small preview - see full banner on customer dashboard</p>
          </CardContent>
        </Card>
      )}

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          id="banner-url"
          type="url"
          placeholder="https://example.com/your-banner-image.jpg"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1"
        />
        <Button type="button" onClick={handleUrlSubmit} disabled={disabled || !urlInput.trim()}>
          <Link className="h-4 w-4 mr-2" />
          Add URL
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: You can use image hosting services like Imgur, Cloudinary, or any direct image URL
      </p>
    </div>
  )
}
