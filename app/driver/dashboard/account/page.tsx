"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Upload } from "lucide-react"

const ImageUploadPlaceholder = ({ className }: { className?: string }) => (
  <div
    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${className}`}
  >
    <div className="flex flex-col items-center justify-center pt-5 pb-6">
      <Upload className="w-8 h-8 mb-4 text-gray-500" />
      <p className="mb-2 text-sm text-gray-500">
        <span className="font-semibold">Click to upload</span>
      </p>
      <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
    </div>
  </div>
)

export default function DriverAccountPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Account Information</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg?height=80&width=80" />
              <AvatarFallback>NK</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Photo</Button>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue="Nis Kha" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue="+1 (555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="nis.kha@example.com" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" defaultValue="15/04/1990" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Kent St, Sydney, NSW, 2000" />
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
              <Input id="vehicleType" defaultValue="Toyota Camry 2020" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input id="licensePlate" defaultValue="ABC 123" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="regNumber">Registration Number</Label>
              <Input id="regNumber" defaultValue="REG123456789" />
            </div>
          </div>
          <div>
            <Label>Vehicle Photos</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=180&width=320"
                  alt="Vehicle photo 1"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=180&width=320"
                  alt="Vehicle photo 2"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <ImageUploadPlaceholder />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Input id="bankAccount" defaultValue="•••• •••• •••• 4242" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input id="routingNumber" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

