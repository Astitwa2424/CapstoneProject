"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateRestaurantProfile } from "@/app/restaurant/profile/actions"
import { toast } from "sonner"
import { Loader2, MapPin, Phone, Globe, Facebook, Instagram, Twitter, CreditCard } from "lucide-react"

interface AccountInformationFormProps {
  initialData: any
  userData: any
}

export function AccountInformationForm({ initialData, userData }: AccountInformationFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateRestaurantProfile(formData)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">ℹ</span>
            </div>
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData?.name || ""}
                placeholder="Enter restaurant name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={userData?.email || ""}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessRegistrationNumber">Business Registration</Label>
              <Input
                id="businessRegistrationNumber"
                name="businessRegistrationNumber"
                defaultValue={initialData?.businessRegistrationNumber || ""}
                placeholder="e.g., 1234567890"
              />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID</Label>
              <Input id="taxId" name="taxId" defaultValue={initialData?.taxId || ""} placeholder="e.g., TAX123456789" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Restaurant Category</Label>
              <Select name="category" defaultValue={initialData?.category || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast-food">Fast Food</SelectItem>
                  <SelectItem value="casual-dining">Casual Dining</SelectItem>
                  <SelectItem value="fine-dining">Fine Dining</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="food-truck">Food Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine Types</Label>
              <Input
                id="cuisine"
                name="cuisine"
                defaultValue={initialData?.cuisine?.join(", ") || ""}
                placeholder="e.g., Italian, Mexican, Asian"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple cuisines with commas</p>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ""}
              placeholder="Brief description of your restaurant"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Primary Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={initialData?.phone || ""}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={initialData?.website || ""}
                  placeholder="https://www.yourrestaurant.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Social Media</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Facebook className="absolute left-3 top-3 w-4 h-4 text-blue-600" />
                <Input
                  name="facebookUrl"
                  defaultValue={initialData?.facebookUrl || ""}
                  placeholder="Facebook URL"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 w-4 h-4 text-pink-600" />
                <Input
                  name="instagramUrl"
                  defaultValue={initialData?.instagramUrl || ""}
                  placeholder="Instagram URL"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                <Input
                  name="twitterUrl"
                  defaultValue={initialData?.twitterUrl || ""}
                  placeholder="Twitter URL"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              name="streetAddress"
              defaultValue={initialData?.streetAddress || ""}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={initialData?.city || ""} placeholder="Sydney" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={initialData?.state || ""} placeholder="NSW" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={initialData?.postalCode || ""}
                placeholder="2000"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select name="country" defaultValue={initialData?.country || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="united-states">United States</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
              <Input
                id="bankAccountNumber"
                name="bankAccountNumber"
                defaultValue={initialData?.bankAccountNumber || ""}
                placeholder="**** **** **** 4567"
              />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                name="bankName"
                defaultValue={initialData?.bankName || ""}
                placeholder="National Bank"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="swiftCode">SWIFT Code</Label>
              <Input
                id="swiftCode"
                name="swiftCode"
                defaultValue={initialData?.swiftCode || ""}
                placeholder="ATLAUS3XXXX"
              />
            </div>
            <div>
              <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
              <Input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialData?.deliveryFee || ""}
                placeholder="5.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="minOrder">Minimum Order ($)</Label>
            <Input
              id="minOrder"
              name="minOrder"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initialData?.minOrder || ""}
              placeholder="15.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
