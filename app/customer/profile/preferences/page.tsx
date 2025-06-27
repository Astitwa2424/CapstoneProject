"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Updates</Label>
                  <p className="text-sm text-gray-600">Get notified about your order status</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Promotions</Label>
                  <p className="text-sm text-gray-600">Receive offers and discounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Restaurants</Label>
                  <p className="text-sm text-gray-600">Get notified when new restaurants join</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Dietary Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Vegetarian</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Vegan</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Gluten-Free</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Halal</Label>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">App Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Default Delivery Address</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select default address" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home Address</SelectItem>
                    <SelectItem value="work">Work Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Preferred Cuisine</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select preferred cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="mexican">Mexican</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
