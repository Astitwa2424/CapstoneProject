"use client"

import { useEffect, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDriverProfile, updateDriverProfile } from "@/app/driver/actions"
import { toast } from "sonner"
import type { DriverProfile, User } from "@prisma/client"
import { Loader2 } from "lucide-react"
import {ImageUpload} from "@/components/ui/image-upload"
import { Skeleton } from "@/components/ui/skeleton"

type ProfileWithUser = DriverProfile & { user: User }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save Changes
    </Button>
  )
}

function AccountPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Account Information</h1>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`space-y-2 ${i === 4 ? "md:col-span-2" : ""}`}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DriverAccountPage() {
  const [profile, setProfile] = useState<ProfileWithUser | null>(null)
  const [loading, setLoading] = useState(true)

  const initialState = { error: null, success: false }
  const [state, formAction] = useFormState(updateDriverProfile, initialState)

  const [profileImage, setProfileImage] = useState("")
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([])

  useEffect(() => {
    async function fetchProfile() {
      try {
        const fetchedProfile = await getDriverProfile()
        if (fetchedProfile) {
          setProfile(fetchedProfile)
          setProfileImage(fetchedProfile.profileImage || fetchedProfile.user.image || "")
          setVehiclePhotos(fetchedProfile.vehiclePhotos || [])
        }
      } catch (error) {
        toast.error("Failed to load profile.")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (state.error) {
      toast.error("Failed to update profile", { description: state.error })
    }
    if (state.success) {
      toast.success("Profile updated successfully!")
    }
  }, [state])

  const handleFormAction = (formData: FormData) => {
    formData.set("profileImage", profileImage)
    formData.delete("vehiclePhotos[]")
    vehiclePhotos.forEach((photo) => {
      formData.append("vehiclePhotos[]", photo)
    })
    formAction(formData)
  }

  if (loading) {
    return <AccountPageSkeleton />
  }

  if (!profile) {
    return <div>Could not load driver profile. Please try again later.</div>
  }

  const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : ""

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Account Information</h1>
      <form action={handleFormAction} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <SubmitButton />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileImage || "/placeholder.svg"} />
                <AvatarFallback>
                  {profile.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <ImageUpload onUpload={(url) => setProfileImage(url)} buttonText="Change Photo" />
              <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" defaultValue={profile.user.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={profile.phone || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={profile.user.email || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dateOfBirth" type="date" defaultValue={dob} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={profile.address || ""} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input id="vehicleType" name="vehicleType" defaultValue={profile.vehicleType || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input id="licensePlate" name="plateNumber" defaultValue={profile.plateNumber || ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input id="regNumber" name="registrationNumber" defaultValue={profile.registrationNumber || ""} />
              </div>
            </div>
            <div>
              <Label>Vehicle Photos</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {vehiclePhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <ImageUpload
                      onUpload={(url) => {
                        const newPhotos = [...vehiclePhotos]
                        newPhotos[index] = url
                        setVehiclePhotos(newPhotos)
                      }}
                      existingImageUrl={photo}
                    />
                  </div>
                ))}
                {vehiclePhotos.length < 3 && (
                  <ImageUpload onUpload={(url) => setVehiclePhotos([...vehiclePhotos, url])} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Input id="bankAccount" name="bankAccount" defaultValue={profile.bankAccount || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input id="routingNumber" name="routingNumber" defaultValue={profile.routingNumber || ""} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
