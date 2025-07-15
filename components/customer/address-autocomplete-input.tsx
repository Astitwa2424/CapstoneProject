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
  onAddressSelect: (address: string) => void
}

const libraries = ["places"]

export default function AddressAutocompleteInput({ onAddressSelect }: AddressAutocompleteInputProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  })

  const [value, setValue] = useState("")
  const autocompleteRef = useRef(null)

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      if (place.formatted_address) {
        setValue(place.formatted_address)
        onAddressSelect(place.formatted_address)
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
