"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, Loader2, Link, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface LogoImageUploadProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function LogoImageUpload({ value, onChange, disabled }: LogoImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }

      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        })

        const result = await response.json()

        if (result.success) {
          onChange(result.url)
          toast.success("Restaurant logo uploaded successfully!")
        } else {
          toast.error(result.error || "Failed to upload logo")
        }
      } catch (error) {
        console.error("Upload error:", error)
        toast.error("Failed to upload logo")
      } finally {
        setIsUploading(false)
      }
    },
    [onChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) {
      toast.error("Please enter an image URL")
      return
    }

    if (!urlInput.startsWith("http")) {
      toast.error("Please enter a valid HTTP/HTTPS URL")
      return
    }

    // Test if the URL is a valid image
    const img = new Image()
    img.onload = () => {
      onChange(urlInput)
      setUrlInput("")
      toast.success("Restaurant logo URL added successfully!")
    }
    img.onerror = () => {
      toast.error("Invalid image URL or image cannot be loaded")
    }
    img.src = urlInput
  }, [urlInput, onChange])

  const removeImage = useCallback(() => {
    onChange("")
    setUrlInput("")
    toast.success("Restaurant logo removed")
  }, [onChange])

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Restaurant Logo</Label>

      {value && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative aspect-square w-32 mx-auto overflow-hidden rounded-lg">
              <Image src={value || "/placeholder.svg"} alt="Logo preview" fill className="object-cover" sizes="128px" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-1 top-1"
                onClick={removeImage}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!value && (
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Image URL (Recommended)
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="logo-url"
                  type="url"
                  placeholder="https://example.com/logo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={disabled}
                />
                <Button type="button" onClick={handleUrlSubmit} disabled={disabled || !urlInput.trim()}>
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Recommended: Use image hosting services like Imgur, Cloudinary, or your own CDN
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>File uploads are stored temporarily. Use image URLs for production.</span>
              </div>

              <Card
                className={`border-2 border-dashed transition-colors ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Uploading logo...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Drop your logo here</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        or click to browse (Max 5MB, square format recommended)
                      </p>
                      <Button type="button" variant="outline" disabled={disabled}>
                        Choose File
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={disabled || isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
