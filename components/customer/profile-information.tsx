"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Save, X } from "lucide-react"
import { toast } from "sonner"
import { updateProfile } from "@/app/customer/profile/actions"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  phone: string | null
  dateOfBirth: Date | null
  createdAt: Date
}

interface ProfileInformationProps {
  user: User
}

export function ProfileInformation({ user }: ProfileInformationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const result = await updateProfile(formData)

      if (result.success) {
        toast.success(result.message)
        setIsEditing(false)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return new Date(date).toISOString().split("T")[0]
  }

  const displayDate = (date: Date | null) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.image || "/placeholder.svg?height=64&width=64"} />
            <AvatarFallback className="text-lg">{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user.name || "User"}</CardTitle>
            <p className="text-sm text-gray-500">Customer since {new Date(user.createdAt).getFullYear()}</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={user.name || ""} placeholder="Enter your full name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ""}
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={user.phone || ""}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={formatDate(user.dateOfBirth)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <p className="text-sm text-gray-600 mt-1">{user.name || "Not set"}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm text-gray-600 mt-1">{user.email || "Not set"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Phone</Label>
                <p className="text-sm text-gray-600 mt-1">{user.phone || "Not set"}</p>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <p className="text-sm text-gray-600 mt-1">{displayDate(user.dateOfBirth)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
