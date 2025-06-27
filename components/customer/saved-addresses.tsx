"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Building, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Address {
  id: string
  type: "home" | "work" | "other"
  label: string
  street: string
  city: string
  state: string
  zipCode: string
  phone: string
  isDefault: boolean
}

export function SavedAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      label: "Home Address",
      street: "123 Main Street",
      city: "Sydney",
      state: "NSW",
      zipCode: "2000",
      phone: "+1 (555) 123-4567",
      isDefault: true,
    },
    {
      id: "2",
      type: "work",
      label: "Work Address",
      street: "456 Market Street",
      city: "Sydney",
      state: "NSW",
      zipCode: "2000",
      phone: "+1 (555) 987-6543",
      isDefault: false,
    },
  ])

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-5 h-5" />
      case "work":
        return <Building className="w-5 h-5" />
      default:
        return <Home className="w-5 h-5" />
    }
  }

  const handleAddAddress = () => {
    toast.info("Add new address functionality coming soon!")
  }

  const handleEditAddress = (id: string) => {
    toast.info("Edit address functionality coming soon!")
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((address) => address.id !== id))
    toast.success("Address removed successfully!")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Addresses</CardTitle>
        <Button onClick={handleAddAddress} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-gray-500 mt-1">{getAddressIcon(address.type)}</div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium">{address.label}</p>
                    {address.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEditAddress(address.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
