"use client"

import { useRef, useState } from "react"
import { useLoadScript, Autocomplete } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export interface StructuredAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  fullAddress: string
}

interface AddressAutocompleteInputProps {
  value?: string
  onValueChange?: (value: string) => void
  onAddressSelect: (address: StructuredAddress) => void
}

const libraries = ["places"]

export default function AddressAutocompleteInput({
  value: externalValue,
  onValueChange,
  onAddressSelect,
}: AddressAutocompleteInputProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  })

  const [internalValue, setInternalValue] = useState("")
  const value = externalValue !== undefined ? externalValue : internalValue
  const setValue = onValueChange || setInternalValue

  const autocompleteRef = useRef(null)

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      if (place.formatted_address) {
        setValue(place.formatted_address)

        const structuredAddress: StructuredAddress = {
          street: place.name || "",
          city: "",
          state: "",
          zipCode: "",
          country: "Australia",
          fullAddress: place.formatted_address,
        }

        if (place.address_components) {
          place.address_components.forEach((component: any) => {
            const types = component.types
            if (types.includes("locality")) {
              structuredAddress.city = component.long_name
            } else if (types.includes("administrative_area_level_1")) {
              structuredAddress.state = component.short_name
            } else if (types.includes("postal_code")) {
              structuredAddress.zipCode = component.long_name
            } else if (types.includes("street_number") || types.includes("route")) {
              if (!structuredAddress.street) {
                structuredAddress.street = component.long_name
              } else {
                structuredAddress.street = `${component.long_name} ${structuredAddress.street}`
              }
            }
          })
        }

        onAddressSelect(structuredAddress)
      }
    }
  }

  if (loadError) {
    return <div>Error loading maps. Please check your API key.</div>
  }
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading address input...</span>
      </div>
    )
  }

  return (
    <Autocomplete
      onLoad={(ref) => (autocompleteRef.current = ref)}
      onPlaceChanged={handlePlaceChanged}
      options={{
        types: ["address"],
        componentRestrictions: { country: "au" }, // Changed to Australia
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="address">Delivery Address</Label>
        <Input
          id="address"
          type="text"
          placeholder="Start typing your delivery address..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full"
        />
      </div>
    </Autocomplete>
  )
}
